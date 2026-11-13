// Shows the current term and the latest notices to every logged-in student
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const page = location.pathname.split("/").pop() || "index.html";
const COUNT_PAGES = ["classes.html", "my-classes.html"];
const NOBANNER = ["exams.html", "certificate.html", "classes.html", "admin.html", "teacher.html", "announcements.html"];
const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const pad = n => String(n).padStart(2, "0");
const now = new Date();
const today = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
const toDate = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); };
const fd = s => toDate(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

// Countdown card: how long until the next term begins (shown on the student's class pages while no term is running)
async function termCountdown(u) {
  if (!COUNT_PAGES.includes(page) || document.getElementById("tcd")) return;
  let terms = [];
  try { terms = (await getDocs(collection(db, "terms"))).docs.map(d => d.data()); } catch (e) { return; }
  terms.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
  if (terms.some(t => today >= t.startDate && today <= t.endDate)) return;
  const next = terms.find(t => today <= t.startDate && toDate(t.startDate) > new Date());
  if (!next) return;
  let nm = u.displayName || "";
  try { const s = await getDoc(doc(db, "students", u.uid)); if (s.exists() && s.data().name) nm = s.data().name; } catch (e) {}
  nm = String(nm).trim().split(/\s+/).slice(0, 2).join(" ");
  const when = toDate(next.startDate), long = when.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const st = document.createElement("style");
  st.textContent = ".tcd{background:linear-gradient(160deg,var(--night,#072f25),var(--deep,#0a4535));color:#f2faf5;border:2px solid #f0be4d;border-radius:16px;padding:18px 14px;margin:0 0 18px;text-align:center}.tcd .tt{font-weight:700;font-size:1.05rem;letter-spacing:.02em}.tcd .tt b{color:#ffe9a6}.tcd .rw{display:flex;justify-content:center;align-items:flex-start;gap:6px;margin:12px 0 8px}.tcd .bx{min-width:62px}.tcd .bx b{display:block;font-size:2.4rem;line-height:1.1;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}.tcd .bx span{font-size:.68rem;letter-spacing:.12em;color:#cfe8dc}.tcd .sp{font-size:2rem;font-weight:800;color:#f0be4d;line-height:1.15}.tcd p{margin:6px auto 0;max-width:560px;line-height:1.6;font-size:.95rem;color:#e3f2ea}.tcd p b{color:#fff}@media(max-width:420px){.tcd .bx{min-width:52px}.tcd .bx b{font-size:2rem}}";
  document.head.appendChild(st);
  const box = document.createElement("div"); box.id = "tcd"; box.className = "tcd";
  box.innerHTML = '<div class="tt">' + esc(next.name || "Next term") + " " + esc(next.session || "") + ' begins on <b>' + esc(long) + '</b></div><div class="rw"><div class="bx"><b id="tcd-d">00</b><span>DAYS</span></div><div class="sp">:</div><div class="bx"><b id="tcd-h">00</b><span>HOURS</span></div><div class="sp">:</div><div class="bx"><b id="tcd-m">00</b><span>MINUTES</span></div><div class="sp">:</div><div class="bx"><b id="tcd-s">00</b><span>SECONDS</span></div></div><p>' + (nm ? "Assalamu alaikum, <b>" + esc(nm) + "</b>! " : "Assalamu alaikum! ") + 'We hope you are ready for another great term. It starts on <b>' + esc(fd(next.startDate)) + '</b>, in shaa Allah. Revise what you learned and keep your books and device ready.</p>';
  const main = document.querySelector("main.page"), pills = document.querySelector(".pills");
  if (main) main.insertAdjacentElement("afterbegin", box);
  else if (pills) pills.insertAdjacentElement("afterend", box);
  else { const hd = document.querySelector("header"); if (hd) hd.insertAdjacentElement("afterend", box); else return; }
  const tick = () => {
    const ms = when - new Date();
    if (ms <= 0) { box.innerHTML = '<div class="tt">🎉 <b>' + esc(next.name || "The new term") + '</b> has begun. Welcome back!</div>'; clearInterval(iv); return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4), sc = Math.floor(ms % 6e4 / 1e3);
    document.getElementById("tcd-d").textContent = pad(d); document.getElementById("tcd-h").textContent = pad(h); document.getElementById("tcd-m").textContent = pad(m); document.getElementById("tcd-s").textContent = pad(sc);
  };
  const iv = setInterval(tick, 1000); tick();
}

onAuthStateChanged(auth, async u => {
  if (!u) return;
  termCountdown(u);

  // "Notices" link in the menu
  const nv = document.querySelector("header nav");
  if (nv && !nv.querySelector('[href="announcements.html"]')) {
    const a = document.createElement("a");
    a.href = "announcements.html"; a.textContent = "Notices";
    nv.insertBefore(a, nv.querySelector("[data-logout]"));
  }

  if (NOBANNER.includes(page) || document.getElementById("pbar")) return;
  try { if (sessionStorage.getItem("pbar_x")) return; } catch (e) {}

  let terms = [], anns = [];
  try { terms = (await getDocs(collection(db, "terms"))).docs.map(d => d.data()); } catch (e) {}
  try { anns = (await getDocs(collection(db, "announcements"))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) {}

  terms.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
  const cur = terms.find(t => today >= t.startDate && today <= t.endDate);
  const next = terms.find(t => today < t.startDate);
  anns.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.createdAt ? b.createdAt.seconds : 0) - (a.createdAt ? a.createdAt.seconds : 0));
  const seen = parseInt(store.get("ann_seen")) || 0;
  const top = anns.slice(0, 2);

  let h = "";
  if (cur) {
    const left = Math.max(0, Math.round((toDate(cur.endDate) - toDate(today)) / 86400000));
    h += `<div class="pt">📅 <b>${esc(cur.name)} ${esc(cur.session)}</b> · ${fd(cur.startDate)} to ${fd(cur.endDate)} · ${left} day${left === 1 ? "" : "s"} left</div>`;
  } else if (next && !COUNT_PAGES.includes(page)) {
    h += `<div class="pt">📅 Next term: <b>${esc(next.name)} ${esc(next.session)}</b> begins on ${fd(next.startDate)}</div>`;
  }
  top.forEach(a => {
    const isNew = a.createdAt && a.createdAt.seconds > seen;
    const body = String(a.body || ""); const sn = body.length > 140 ? body.slice(0, 140) + "..." : body;
    h += `<div class="pn">📢 <b>${esc(a.title)}</b>${isNew ? ' <span class="nw">NEW</span>' : ""} · ${esc(sn)}</div>`;
  });
  if (!h) return;
  h += '<a class="pa" href="announcements.html">Open the notice board &rarr;</a>';

  const st = document.createElement("style");
  st.textContent = ".pbar{position:relative;background:var(--night);color:#f2faf5;border-bottom:4px solid #f0be4d;border-radius:12px;padding:12px 40px 12px 16px;margin:0 0 18px;font-size:.92rem;line-height:1.6}.pbar.wide{border-radius:0;margin:0}.pbar b{color:#fff}.pbar .nw{background:#f0be4d;color:var(--night);border-radius:999px;padding:1px 8px;font-size:.7rem;font-weight:700}.pbar .pa{display:inline-block;margin-top:4px;color:#f0be4d;font-weight:700;text-decoration:none}.pbar .x{position:absolute;right:10px;top:6px;background:none;border:0;color:#d3e8dc;font-size:1.3rem;cursor:pointer}";
  document.head.appendChild(st);

  const bar = document.createElement("div");
  bar.id = "pbar"; bar.className = "pbar"; bar.innerHTML = h + '<button class="x" type="button" aria-label="Close">&times;</button>';
  bar.querySelector(".x").onclick = () => { bar.remove(); try { sessionStorage.setItem("pbar_x", "1"); } catch (e) {} };

  const main = document.querySelector("main.page");
  const pills = document.querySelector(".pills");
  if (main) main.insertAdjacentElement("afterbegin", bar);
  else if (pills) { bar.classList.add("wide"); pills.insertAdjacentElement("afterend", bar); }
  else { const hd = document.querySelector("header"); if (hd) hd.insertAdjacentElement("afterend", bar); }
});
