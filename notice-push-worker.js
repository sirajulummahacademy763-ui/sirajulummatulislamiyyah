// Cloudflare Worker: "notice-push"
// When the admin sends a notice, the admin page calls this Worker. The Worker:
//   1. checks the caller is really the admin (Firebase login + admins collection)
//   2. sends a phone notification to the students who turned notifications on
//
// Secrets to add in the Worker settings (type "Secret"):
//   FIREBASE_SERVICE_ACCOUNT  the full contents of the Firebase service account JSON file
//                             (the same one used by the flutterwave-coins Worker)
//   VAPID_PUBLIC              the public key (given in chat)
//   VAPID_PRIVATE             the private key (given in chat)
//
// Students' phones are stored in the Firestore collection "pushSubs".

const PAGE = 20; // phones per call (keeps us inside Cloudflare's free limit)
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const path = new URL(req.url).pathname;
    if (req.method !== "POST" || path !== "/notify") return new Response("notice-push is running", { headers: CORS });

    try {
      const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
      const idToken = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      const uid = idToken ? await verifyIdToken(idToken, sa.project_id) : null;
      if (!uid) return json({ error: "not signed in" }, 401);

      const token = await googleToken(sa);
      const base = "https://firestore.googleapis.com/v1/projects/" + sa.project_id + "/databases/(default)/documents";
      const auth = { Authorization: "Bearer " + token };

      const adm = await fetch(base + "/admins/" + encodeURIComponent(uid), { headers: auth });
      if (adm.status !== 200) return json({ error: "admin only" }, 403);

      const b = await req.json().catch(() => ({}));
      const payload = JSON.stringify({
        id: String(b.id || "").slice(0, 60),
        title: String(b.title || "New notice").slice(0, 90),
        body: String(b.body || "").slice(0, 160),
        url: "/notices.html"
      });

      let url = base + "/pushSubs?pageSize=" + PAGE;
      if (b.cursor) url += "&pageToken=" + encodeURIComponent(b.cursor);
      const list = await (await fetch(url, { headers: auth })).json();
      const docs = list.documents || [];

      let sent = 0, failed = 0, removed = 0;
      await Promise.all(docs.map(async d => {
        const f = d.fields || {};
        const sub = { endpoint: f.endpoint && f.endpoint.stringValue, p256dh: f.p256dh && f.p256dh.stringValue, auth: f.auth && f.auth.stringValue };
        if (!sub.endpoint || !sub.p256dh || !sub.auth) { failed++; return; }
        try {
          const r = await sendPush(env, sub, payload);
          if (r.ok) sent++;
          else if (r.status === 404 || r.status === 410) {
            removed++;
            await fetch(base + "/pushSubs/" + d.name.split("/").pop(), { method: "DELETE", headers: auth });
          } else failed++;
        } catch (e) { failed++; }
      }));

      return json({ sent, failed, removed, next: list.nextPageToken || null });
    } catch (e) {
      console.error("notice-push error:", String((e && e.message) || e));
      return json({ error: "server error" }, 500);
    }
  }
};

/* ---------- base64url helpers ---------- */
const enc = new TextEncoder();
const toB64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const fromB64u = s => {
  s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "=";
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
};
const concat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };

/* ---------- Web Push (RFC 8030 + VAPID + RFC 8291 encryption) ---------- */
async function sendPush(env, sub, payload) {
  const origin = new URL(sub.endpoint).origin;
  const jwt = await vapidJwt(env, origin);
  const body = await encryptPayload(sub, enc.encode(payload));
  return fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: "vapid t=" + jwt + ", k=" + env.VAPID_PUBLIC,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
      Urgency: "high"
    },
    body
  });
}

async function vapidJwt(env, aud) {
  const pub = fromB64u(env.VAPID_PUBLIC);
  const key = await crypto.subtle.importKey("jwk", {
    kty: "EC", crv: "P-256", d: env.VAPID_PRIVATE, x: toB64u(pub.slice(1, 33)), y: toB64u(pub.slice(33, 65)), ext: true
  }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = toB64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claim = toB64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: "mailto:admin@sirajul-ummah.com.ng" })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(head + "." + claim));
  return head + "." + claim + "." + toB64u(sig);
}

async function hkdf(salt, ikm, info, bytes) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, bytes * 8));
}

async function encryptPayload(sub, plain) {
  const uaPublic = fromB64u(sub.p256dh), authSecret = fromB64u(sub.auth);
  const asKeys = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", asKeys.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, asKeys.privateKey, 256));
  const prk = await hkdf(authSecret, secret, concat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, prk, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, prk, enc.encode("Content-Encoding: nonce\0"), 12);
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, concat(plain, new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 0x10, 0]); // record size 4096
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, data);
}

/* ---------- Check a Firebase login token (no libraries) ---------- */
async function verifyIdToken(token, projectId) {
  try {
    const [h, p, s] = token.split(".");
    const head = JSON.parse(new TextDecoder().decode(fromB64u(h)));
    const pay = JSON.parse(new TextDecoder().decode(fromB64u(p)));
    const now = Math.floor(Date.now() / 1000);
    if (head.alg !== "RS256" || pay.aud !== projectId || pay.iss !== "https://securetoken.google.com/" + projectId || !pay.sub || pay.exp < now) return null;
    const jwks = await (await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")).json();
    const jwk = (jwks.keys || []).find(k => k.kid === head.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, fromB64u(s), enc.encode(h + "." + p));
    return ok ? pay.sub : null;
  } catch (e) { return null; }
}

/* ---------- Sign in to Google with the service account ---------- */
async function googleToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const head = toB64u(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claim = toB64u(enc.encode(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  })));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(head + "." + claim));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + head + "." + claim + "." + toB64u(sig)
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("Google sign-in failed: " + JSON.stringify(j));
  return j.access_token;
}
