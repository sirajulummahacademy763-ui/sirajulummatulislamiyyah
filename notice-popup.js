// Shows new notices the moment they arrive, on any page of the portal (read only).
// Also offers (once) to turn on phone notifications so notices arrive even when the site is closed.
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, query, orderBy, limit, onSnapshot, setDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { VAPID_PUBLIC } from "./notice-config.js";

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

let uid = "", myName = "Student", started = false;

const css = document.createElement("style");
css.textContent = `
#nt-toast{position:fixed;top:12px;left:50%;transform:translate(-50%,-140%);width:min(520px,calc(100% - 24px));z-index:100000;background:#12163a;color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 14px 40px -10px rgba(0,0,0,.55);border:1.5px solid #f5b94a;transition:transform .45s cubic-bezier(.2,.9,.3,1.2);font-family:Figtree,system-ui,sans-serif}
#nt-toast.show{transform:translate(-50%,0)}
#nt-toast .k{display:flex;align-items:center;gap:8px;font-size:.78rem;color:#f5b94a;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
#nt-toast .k i{width:9px;height:9px;border-radius:50%;background:#f5b94a;animation:ntp 1.2s infinite}
@keyframes ntp{0%{box-shadow:0 0 0 0 rgba(245,185,74,.7)}100%{box-shadow:0 0 0 10px rgba(245,185,74,0)}}
#nt-toast b{display:block;font-size:1.05rem;margin:6px 0 2px}
#nt-toast p{margin:0;color:#d8dbef;font-size:.92rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#nt-toast small{display:block;margin-top:4px;color:#aab0d6}
#nt-toast .r{display:flex;gap:8px;margin-top:10px}
.nt-b{font:inherit;font-weight:700;padding:9px 16px;border:0;border-radius:10px;cursor:pointer;background:#f5b94a;color:#12163a}
.nt-b.g{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.35)}
#nt-modal{position:fixed;inset:0;z-index:100001;background:rgba(10,12,35,.65);display:flex;align-items:center;justify-content:center;padding:14px;font-family:Figtree,system-ui,sans-serif}
#nt-modal .c{background:#fff;color:#12163a;border-radius:18px;max-width:560px;width:100%;max-height:88vh;overflow:auto;padding:20px}
#nt-modal h3{margin:0 0 4px;font-size:1.3rem}
#nt-modal .t{color:#4b5072;font-size:.85rem;margin-bottom:10px}
#nt-modal .m{white-space:pre-wrap;line-height:1.55;margin-bottom:14px}
#nt-modal textarea{width:100%;box-sizing:border-box;min-height:90px;padding:10px;border:1.5px solid #cfd3e8;border-radius:10px;font:inherit;resize:vertical}
#nt-modal .row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center}
#nt-modal .b2{background:#12163a;color:#fff}
#nt-modal .b3{background:#fff;color:#12163a;border:1.5px solid #cfd3e8}
#nt-modal .ms{font-size:.9rem}
#nt-push{position:fixed;left:12px;bottom:12px;z-index:99990;width:min(340px,calc(100% - 100px));background:#fff;color:#12163a;border:1.5px solid #cfd3e8;border-radius:14px;padding:12px 14px;box-shadow:0 10px 30px -12px rgba(0,0,0,.4);font-family:Figtree,system-ui,sans-serif;font-size:.9rem}
#nt-push .r{display:flex;gap:8px;margin-top:8px}
`;
document.head.appendChild(css);

/* ---------- Pop-up for new notices ---------- */
let toast = null, current = null, pending = [], seenKey = "";

function seenSecs() { return Number(store.get(seenKey) || 0); }
function markSeen(secs) { if (secs > seenSecs()) store.set(seenKey, String(secs)); }

function onNotices(snap) {
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.createdAt && a.createdAt.seconds);
  if (!rows.length) return;
  if (store.get(seenKey) == null) {
    // First time on this phone: only pop up a notice from the last 3 days, never a pile of old ones
    const cut = Date.now() / 1000 - 3 * 86400;
    store.set(seenKey, String(Math.max(0, ...rows.filter(a => a.createdAt.seconds < cut).map(a => a.createdAt.seconds), 0)));
  }
  const s = seenSecs();
  pending = rows.filter(a => a.createdAt.seconds > s).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  if (pending.length) showToast(pending[0], pending.length - 1);
  else hideToast();
}

function showToast(a, more) {
  if (current && current.id === a.id && toast) { const sm = toast.querySelector("small"); if (sm) sm.textContent = more ? "+" + more + " more new notice" + (more > 1 ? "s" : "") : ""; return; }
  current = a;
  if (toast) toast.remove();
  toast = document.createElement("div");
  toast.id = "nt-toast";
  toast.setAttribute("role", "alert");
  toast.innerHTML = `<div class="k"><i></i> New notice from the institute</div><b>${esc(a.title)}</b><p>${esc(a.body)}</p><small>${more ? "+" + more + " more new notice" + (more > 1 ? "s" : "") : ""}</small>
    <div class="r"><button class="nt-b" type="button" data-o>Read</button><button class="nt-b g" type="button" data-c>Close</button></div>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast && toast.classList.add("show")));
  try { navigator.vibrate && navigator.vibrate([150, 80, 150]); } catch (e) {}
  toast.querySelector("[data-o]").onclick = () => openModal(a);
  toast.querySelector("[data-c]").onclick = () => { markSeen(Math.max(...pending.map(p => p.createdAt.seconds))); hideToast(); };
}

function hideToast() {
  if (!toast) return;
  const t = toast; toast = null; current = null;
  t.classList.remove("show"); setTimeout(() => t.remove(), 500);
}

function openModal(a) {
  markSeen(Math.max(...pending.map(p => p.createdAt.seconds), a.createdAt.seconds));
  hideToast();
  const when = a.createdAt ? new Date(a.createdAt.seconds * 1000).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  const m = document.createElement("div");
  m.id = "nt-modal";
  m.innerHTML = `<div class="c" role="dialog" aria-modal="true"><h3>${esc(a.title)}</h3><div class="t">${esc(when)}</div><div class="m">${esc(a.body)}</div>
    <div class="row"><button class="nt-b b2" type="button" data-x>Close</button></div></div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  m.querySelector("[data-x]").onclick = close;
  m.addEventListener("click", e => { if (e.target === m) close(); });
}

/* ---------- Phone notifications (work even when the site is closed) ---------- */
const canPush = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const b64ToU8 = s => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };

async function savePush() {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const key = b64ToU8(VAPID_PUBLIC);
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  const j = sub.toJSON();
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(j.endpoint));
  const id = uid + "_" + [...new Uint8Array(h)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
  await setDoc(doc(db, "pushSubs", id), { uid, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, createdAt: serverTimestamp() });
}

function pushSetup() {
  if (!canPush()) return;
  if (Notification.permission === "granted") { savePush().catch(e => console.warn("push:", e)); return; }
  if (Notification.permission !== "default") return;
  const last = Number(store.get("nt_push_no") || 0);
  if (Date.now() - last < 7 * 86400 * 1000) return;
  const box = document.createElement("div");
  box.id = "nt-push";
  box.innerHTML = `<b>Get notices on your phone</b><br>Turn on notifications to receive new notices even when you are not on the site.<div class="r"><button class="nt-b b2" type="button" data-y style="background:#12163a;color:#fff">Turn on</button><button class="nt-b b3" type="button" data-n style="background:#fff;color:#12163a;border:1.5px solid #cfd3e8">Not now</button></div><div id="nt-pm" style="margin-top:6px"></div>`;
  document.body.appendChild(box);
  box.querySelector("[data-n]").onclick = () => { store.set("nt_push_no", String(Date.now())); box.remove(); };
  box.querySelector("[data-y]").onclick = async () => {
    const pm = box.querySelector("#nt-pm");
    try {
      const p = await Notification.requestPermission();
      if (p !== "granted") { pm.textContent = "Notifications were not allowed."; setTimeout(() => box.remove(), 2500); return; }
      await savePush();
      box.innerHTML = "<b>Done.</b> You will now receive new notices on this phone.";
      setTimeout(() => box.remove(), 3500);
    } catch (e) { pm.style.color = "#b3261e"; pm.textContent = "Could not turn on: " + (e.message || e.code); }
  };
}

/* ---------- Start when the student is logged in ---------- */
onAuthStateChanged(auth, async u => {
  if (!u || started) return;
  started = true; uid = u.uid; seenKey = "nt_seen_" + uid;
  myName = u.displayName || u.email || "Student";
  try { const s = await getDoc(doc(db, "students", uid)); if (s.exists() && s.data().name) myName = s.data().name; } catch (e) {}
  let admin = false;
  try { admin = (await getDoc(doc(db, "admins", uid))).exists(); } catch (e) {}
  if (admin) return; // the admin does not need pop-ups for their own notices
  onSnapshot(query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(10)), onNotices, e => console.warn("notices:", e.code));
  setTimeout(pushSetup, 4000);
});
