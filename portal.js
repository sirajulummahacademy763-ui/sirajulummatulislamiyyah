// Shows the current term and the latest notices to every logged-in student
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const page = location.pathname.split("/").pop() || "index.html";
const NOBANNER = ["exams.html", "certificate.html", "classes.html", "admin.html", "teacher.html", "announcements.html"];
const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const pad = n => String(n).padStart(2, "0");
const now = new Date();
const today = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
const toDate = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); };
const fd = s => toDate(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

onAuthStateChanged(auth, async u => {
  if (!u) return;

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
  } else if (next) {
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
  st.textContent = ".pbar{position:relative;background:#12163a;color:#eef0f8;border-bottom:4px solid #f5b94a;border-radius:12px;padding:12px 40px 12px 16px;margin:0 0 18px;font-size:.92rem;line-height:1.6}.pbar.wide{border-radius:0;margin:0}.pbar b{color:#fff}.pbar .nw{background:#f5b94a;color:#12163a;border-radius:999px;padding:1px 8px;font-size:.7rem;font-weight:700}.pbar .pa{display:inline-block;margin-top:4px;color:#f5b94a;font-weight:700;text-decoration:none}.pbar .x{position:absolute;right:10px;top:6px;background:none;border:0;color:#cfd3e8;font-size:1.3rem;cursor:pointer}";
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
