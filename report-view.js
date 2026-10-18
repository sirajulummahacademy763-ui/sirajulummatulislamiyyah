// Builds and draws a student's report (used by report-card.html and parent.html).
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const slug = s => String(s).replace(/[^A-Za-z0-9]+/g, "-");
const SEC = { islamic: "Arabic and Islamic", western: "Western", tech: "Technology" };
const secs = x => (x && x.seconds) || 0;
const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

export async function buildReport(db, uid, name, classes) {
  const out = { uid, name, classes: classes || {}, term: null, generatedAt: Date.now(), exams: [], attendance: [], progress: [], stars: 0 };
  // current term (or the latest one that ended)
  try {
    const ts = (await getDocs(collection(db, "terms"))).docs.map(d => d.data()).sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
    const t = todayStr();
    const cur = ts.find(x => t >= x.startDate && t <= x.endDate) || ts.filter(x => t > x.endDate).pop() || null;
    if (cur) out.term = { name: cur.name || "", session: cur.session || "", startDate: cur.startDate, endDate: cur.endDate };
  } catch (e) {}
  const a = out.term ? new Date(out.term.startDate + "T00:00:00") : null;
  const b = out.term ? new Date(out.term.endDate + "T23:59:59") : null;
  const inTerm = s => !out.term || (s && s * 1000 >= a.getTime() && s * 1000 <= b.getTime());

  // exam results from every course the student joined
  try {
    const en = await getDocs(query(collection(db, "enrollments"), where("uid", "==", uid)));
    for (const e of en.docs) {
      const cid = e.data().courseId; if (!cid) continue;
      let ctitle = cid;
      try { const c = await getDoc(doc(db, "courses", cid)); if (c.exists()) ctitle = c.data().title || cid; } catch (x) {}
      let rs = [];
      try { rs = (await getDocs(query(collection(db, "courses", cid, "examResults"), where("uid", "==", uid)))).docs.map(d => d.data()); } catch (x) {}
      for (const r of rs) {
        if (!inTerm(secs(r.createdAt))) continue;
        let et = r.examId, tot = null;
        try { const ex = await getDoc(doc(db, "courses", cid, "exams", r.examId)); if (ex.exists()) { const d = ex.data(); et = d.title || r.examId; tot = d.total ?? d.totalMarks ?? d.maxScore ?? d.marks ?? null; } } catch (x) {}
        out.exams.push({ course: ctitle, exam: et, score: typeof r.score === "number" ? r.score : null, total: tot, at: secs(r.createdAt) });
      }
    }
    out.exams.sort((x, y) => y.at - x.at);
  } catch (e) {}

  // attendance and stars in the student's class rooms
  for (const sec of Object.keys(SEC)) {
    const lv = out.classes[sec]; if (!lv || lv === "none") continue;
    const rid = sec + "__" + slug(lv);
    try {
      const rm = await getDoc(doc(db, "classrooms", rid)); if (!rm.exists()) continue;
      let ss = (await getDocs(collection(db, "classrooms", rid, "sessions"))).docs;
      ss = ss.filter(d => inTerm(secs(d.data().openedAt)));
      let att = 0;
      for (const d of ss.slice(0, 120)) { try { if ((await getDoc(doc(db, "classrooms", rid, "sessions", d.id, "attendance", uid))).exists()) att++; } catch (x) {} }
      out.attendance.push({ room: lv + " · " + SEC[sec], attended: att, total: Math.min(ss.length, 120) });
      try { const st = await getDocs(query(collection(db, "classrooms", rid, "starLog"), where("uid", "==", uid))); out.stars += st.docs.filter(d => inTerm(secs(d.data().createdAt))).length; } catch (x) {}
      try {
        const pr = await getDocs(query(collection(db, "classrooms", rid, "progress"), where("uid", "==", uid)));
        pr.docs.map(d => d.data()).filter(x => inTerm(secs(x.createdAt))).forEach(x => out.progress.push({ surah: x.surah || "", from: x.from || 0, to: x.to || 0, status: x.status || "", at: secs(x.createdAt) }));
      } catch (x) {}
    } catch (e) {}
  }
  out.progress.sort((x, y) => y.at - x.at); out.progress = out.progress.slice(0, 20);
  return out;
}

export const reportCss = `
.rp{max-width:820px;margin:0 auto}
.rp .hd{background:#12163a;color:#fff;border-radius:16px;padding:20px 20px 16px;border-bottom:5px solid #f5b94a}
.rp .hd .in{font-family:Amiri,serif;color:#f5b94a;font-size:1.2rem}
.rp .hd h2{margin:2px 0 4px;font-family:Amiri,serif;font-size:2rem;color:#fff}
.rp .hd p{margin:0;color:#c3c7e2;font-size:.95rem}
.rp .cd2{background:#fff;border:1.5px solid #cfd3e8;border-top:4px solid #f5b94a;border-radius:14px;padding:16px;margin-top:14px}
.rp .cd2 h3{margin:0 0 8px;font-size:1.1rem}
.rp table{width:100%;border-collapse:collapse;font-size:.95rem}
.rp th{text-align:left;color:#4b5072;font-weight:700;padding:6px 8px;border-bottom:2px solid #cfd3e8}
.rp td{padding:8px;border-bottom:1px solid #e6e8f3;vertical-align:top}
.rp .num{text-align:right;white-space:nowrap;font-weight:700}
.rp .none{color:#4b5072;margin:0}
.rp .pill{display:inline-block;border-radius:999px;padding:2px 10px;font-size:.8rem;font-weight:700}
.rp .ok{background:#d7f3e3;color:#1c7a4d}.rp .re{background:#fdf1d4;color:#8a5a00}
.rp .big{font-size:1.6rem;font-weight:700;color:#12163a}
.rp .ft{color:#4b5072;font-size:.85rem;margin-top:12px;text-align:center}
@media print{header.top,footer,.noprint,#nt-toast,#nt-push{display:none!important}body{background:#fff!important}.rp .cd2{break-inside:avoid}}
`;

export function renderReport(d) {
  const when = d.generatedAt ? new Date(d.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  const cls = Object.keys(SEC).filter(k => d.classes && d.classes[k] && d.classes[k] !== "none").map(k => `${esc(d.classes[k])} (${SEC[k]})`).join(" · ") || "No class chosen";
  const t = d.term ? `${esc(d.term.name)}${d.term.session ? " · " + esc(d.term.session) : ""}` : "All time";
  let h = `<div class="rp"><div class="hd"><div class="in" dir="rtl" lang="ar">معهد سراج الأمة الإسلامية</div><h2>${esc(d.name)}</h2><p>${cls}</p><p>Report: ${t} · ${esc(when)}</p></div>`;
  h += `<div class="cd2"><h3>Exam results</h3>` + (d.exams && d.exams.length ? `<table><tr><th>Course</th><th>Exam</th><th class="num">Score</th></tr>${d.exams.map(x => `<tr><td>${esc(x.course)}</td><td>${esc(x.exam)}</td><td class="num">${x.score == null ? '<span class="pill re">Awaiting marking</span>' : esc(x.score) + (x.total ? " / " + esc(x.total) : "")}</td></tr>`).join("")}</table>` : `<p class="none">No exam results for this period.</p>`) + `</div>`;
  h += `<div class="cd2"><h3>Attendance in class</h3>` + (d.attendance && d.attendance.length ? `<table><tr><th>Class</th><th class="num">Lectures attended</th></tr>${d.attendance.map(x => `<tr><td>${esc(x.room)}</td><td class="num">${x.attended} of ${x.total}${x.total ? " (" + Math.round(100 * x.attended / x.total) + "%)" : ""}</td></tr>`).join("")}</table>` : `<p class="none">No class attendance recorded for this period.</p>`) + `</div>`;
  h += `<div class="cd2"><h3>Memorization</h3>` + (d.progress && d.progress.length ? `<table><tr><th>Surah</th><th>Ayahs</th><th>Result</th></tr>${d.progress.map(x => `<tr><td>${esc(x.surah)}</td><td>${x.from ? esc(x.from) + "-" + esc(x.to) : ""}</td><td><span class="pill ${x.status === "passed" ? "ok" : "re"}">${x.status === "passed" ? "Passed" : "Needs revision"}</span></td></tr>`).join("")}</table>` : `<p class="none">No memorization recorded for this period.</p>`) + `</div>`;
  h += `<div class="cd2"><h3>Stars from the teacher</h3><div class="big">${d.stars || 0} ⭐</div></div>`;
  h += `<p class="ft">Sirajul Ummah Islamic Institute · sirajul-ummah.com.ng</p></div>`;
  return h;
}
