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
    const ts = (await getDocs(collection(db, "terms"))).docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
    const t = todayStr();
    let cur = ts.find(x => t >= x.startDate && t <= x.endDate) || ts.filter(x => t > x.endDate).pop() || null;
    let up = false;
    if (!cur && ts.length) { cur = ts[0]; up = true; }   // every term is still ahead: use the first one
    if (cur) out.term = { id: cur.id || "", name: cur.name || "", session: cur.session || "", startDate: cur.startDate, endDate: cur.endDate, upcoming: up };
    const nx = cur ? ts.find(x => String(x.startDate) > String(cur.endDate)) : null;
    if (nx) out.nextTerm = { name: nx.name || "", startDate: nx.startDate };
  } catch (e) {}
  // subjects of each class (from the Classes & Timetable page), for the report sheet
  out.sheets = [];
  for (const sec of Object.keys(SEC)) {
    const lv = out.classes[sec]; if (!lv || lv === "none") continue;
    let subjects = [];
    try { const p = await getDoc(doc(db, "classPlans", sec + "__" + String(lv).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, ""))); if (p.exists()) subjects = (p.data().subjects || []).map(x => ({ name: x.name || "", nameAr: x.nameAr || "" })); } catch (e) {}
    out.sheets.push({ sec, level: lv, subjects });
  }
  // issued term marks (entered and issued by the class teachers)
  try {
    const cs = await getDocs(query(collection(db, "reportCards"), where("uid", "==", uid), where("status", "==", "issued")));
    cs.docs.map(d => d.data()).filter(c => !out.term || !out.term.id || c.termId === out.term.id).forEach(c => {
      const g = out.sheets.find(x => x.sec === c.section && x.level === c.level);
      if (g) g.card = { nameAr: c.nameAr || "", marks: c.marks || {}, total: c.total, percentage: c.percentage, grade: c.grade, position: c.position, classSize: c.classSize, by: c.by || "" };
    });
  } catch (e) {}
  // signatures and stamp (uploaded on the Signatures page)
  out.signs = {};
  const ldSign = async id => { try { const s = await getDoc(doc(db, "signatures", id)); const u = s.exists() ? String(s.data().img || "") : ""; return /^data:image\//.test(u) ? u : ""; } catch (e) { return ""; } };
  out.signs.director = await ldSign("director"); out.signs.stamp = await ldSign("stamp");
  for (const g of out.sheets) if (g.card && g.card.by) g.teacherSign = await ldSign(g.card.by);
  const a = out.term ? new Date(out.term.startDate + "T00:00:00") : null;
  const b = out.term ? new Date(out.term.endDate + "T23:59:59") : null;
  const inTerm = s => !out.term || out.term.upcoming || (s && s * 1000 >= a.getTime() && s * 1000 <= b.getTime());

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
.rp .sh{background:#fff;color:#111;border:3px double #12163a;border-radius:18px;padding:14px 14px 12px;margin-bottom:18px}
.rp .shh{text-align:center}
.rp .shh .a1{font-family:Amiri,serif;font-size:clamp(1.25rem,5.4vw,2rem);font-weight:700;color:#12163a;line-height:1.3}
.rp .shh .e1{font-weight:800;font-size:clamp(.78rem,3.2vw,1.2rem);letter-spacing:.02em;color:#12163a}
.rp .shh .tg{font-size:clamp(.6rem,2.3vw,.8rem);color:#4b5072;margin-top:2px}
.rp .ttl{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0 10px;border-top:2px solid #f5b94a;border-bottom:2px solid #f5b94a;padding:6px 0}
.rp .ttl .l{font-family:Georgia,serif;font-style:italic;font-size:clamp(.78rem,3.2vw,1.1rem);flex:1}
.rp .ttl .r{font-family:Amiri,serif;font-size:clamp(.95rem,3.8vw,1.3rem);font-weight:700;flex:1;text-align:right}
.rp .ttl small{font-size:.72em;font-style:normal;font-weight:400;color:#4b5072}
.rp .ttl img{width:clamp(44px,13vw,70px);height:auto}
.rp .fl{display:grid;grid-template-columns:1fr;gap:2px}
.rp .fl .w{grid-column:1/-1}
.rp .f{display:flex;gap:10px;font-size:clamp(.7rem,2.9vw,.95rem);flex-wrap:nowrap;align-items:flex-end}
.rp .f .e{flex:1.45;min-width:0;display:flex;align-items:flex-end;gap:5px}
.rp .f .r{flex:1;min-width:0;display:flex;align-items:flex-end;gap:5px}
.rp .f b{font-weight:800;white-space:nowrap}
.rp .f .a{font-family:Amiri,serif;font-size:1.12em}
.rp .f .v{flex:1;min-width:12px;border-bottom:1px solid #111;min-height:1.15em;line-height:1.25;padding:0 3px;font-weight:600;overflow-wrap:normal;white-space:nowrap;font-size:.92em}
.rp .f .v.va{font-family:Amiri,serif;font-size:1.12em}

.rp table.sc{width:100%;border-collapse:collapse;margin-top:12px;table-layout:fixed}
.rp table.sc th,.rp table.sc td{border:1.5px solid #111;padding:3px 2px;text-align:center;font-size:clamp(.5rem,2.1vw,.82rem);vertical-align:middle;line-height:1.25;word-break:break-word}
.rp table.sc th{background:#eef0f9;font-weight:800;word-break:normal;font-size:clamp(.46rem,1.9vw,.78rem)}
.rp table.sc th.ar,.rp table.sc td.ar{font-family:Amiri,serif;font-size:clamp(.62rem,2.7vw,1rem)}
.rp table.sc th.ar{font-size:clamp(.5rem,2.2vw,.85rem)}
.rp table.sc td.n{text-align:left;font-weight:700;text-transform:uppercase;font-size:clamp(.42rem,1.75vw,.78rem);word-break:normal;overflow-wrap:anywhere;hyphens:auto}
.rp table.sc td.ar.n{text-align:right;text-transform:none;font-size:clamp(.6rem,2.6vw,.95rem);line-height:1.3}
.rp table.sc td{height:2.1em}
.rp table.sc .sj{display:flex;justify-content:space-between;align-items:center;gap:6px;text-align:left}
.rp table.sc .sj>span{min-width:0}
.rp table.sc .sj .a{font-family:Amiri,serif;text-transform:none;font-size:1.25em;text-align:right;white-space:nowrap}
.rp table.sc .nm{display:inline-flex;gap:6px;justify-content:center;align-items:baseline;white-space:nowrap}
.rp table.sc .nm .a{font-family:Amiri,serif;font-size:1.2em}
.rp table.sc th small{display:block;font-family:Amiri,serif;font-size:1.25em;font-weight:700}
.rp table.sc tr.tt td{font-weight:800}
.rp table.sc td.lo{color:#b3261e;font-weight:800}
.rp .hol{margin-top:12px;display:grid;gap:6px}
.rp .sg{display:flex;gap:12px;justify-content:space-between;margin-top:72px;text-align:center;font-size:clamp(.58rem,2.4vw,.82rem)}
.rp .sg div{flex:1;border-top:1.5px solid #111;padding-top:3px;font-weight:700;position:relative}
.rp .sg img{position:absolute;left:50%;transform:translateX(-50%);bottom:100%;max-width:92%;object-fit:contain}
.rp .sg img.sig{max-height:46px}
.rp .sg img.stp{max-height:64px;bottom:calc(100% - 4px);opacity:.92}
.rp .sg .a{font-family:Amiri,serif;font-size:1.15em}
.rp .rec{margin-top:6px}
.rp .rec>h2{font-size:1.15rem;margin:6px 0 0;color:#12163a}
.rp .cd2{background:#fff;border:1.5px solid #cfd3e8;border-top:4px solid #f5b94a;border-radius:14px;padding:16px;margin-top:14px}
.rp .cd2 h3{margin:0 0 8px;font-size:1.1rem}
.rp table.t{width:100%;border-collapse:collapse;font-size:.95rem}
.rp table.t th{text-align:left;color:#4b5072;font-weight:700;padding:6px 8px;border-bottom:2px solid #cfd3e8}
.rp table.t td{padding:8px;border-bottom:1px solid #e6e8f3;vertical-align:top}
.rp .num{text-align:right!important;white-space:nowrap;font-weight:700}
.rp .none{color:#4b5072;margin:0}
.rp .pill{display:inline-block;border-radius:999px;padding:2px 10px;font-size:.8rem;font-weight:700}
.rp .ok{background:#d7f3e3;color:#1c7a4d}.rp .re{background:#fdf1d4;color:#8a5a00}
.rp .big{font-size:1.6rem;font-weight:700;color:#12163a}
.rp .ft{color:#4b5072;font-size:.85rem;margin-top:12px;text-align:center}
@page{size:A4;margin:10mm}
@media print{header.top,footer,.noprint,#nt-toast,#nt-push{display:none!important}body{background:#fff!important}.rp{max-width:none}.rp .sh{break-after:page;border-radius:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.rp .sh:last-of-type{break-after:auto}.rp .cd2{break-inside:avoid}.rp table.sc th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;

const AR = n => String(n).replace(/\d/g, x => "٠١٢٣٤٥٦٧٨٩"[x]);

const LVAR = { "Rawdatul Atfal": "روضة الأطفال", "Ibtidai": "ابتدائي", "I'dadi": "إعدادي", "Thanawi": "ثانوي", "Primary": "الصف الابتدائي", "JSS": "المتوسط (JSS)", "SSS": "الثانوي (SSS)" };
const LVFIX = { "Kindergarten (KG)": "رياض الأطفال (KG)", "Beginner": "مبتدئ", "Intermediate": "متوسط", "Advanced": "متقدم" };
const levelAr = lv => { lv = String(lv || ""); if (LVFIX[lv]) return LVFIX[lv]; const m = lv.match(/^(.*?)\s*(\d+)$/); if (m && LVAR[m[1]]) return LVAR[m[1]] + " " + AR(m[2]); return ""; };
const termAr = n => { n = String(n || ""); if (/first|1st/i.test(n)) return "الفصل الأول"; if (/second|2nd/i.test(n)) return "الفصل الثاني"; if (/third|3rd/i.test(n)) return "الفصل الثالث"; return ""; };
const GRAR = { A: "ممتاز", B: "جيد جدًا", C: "جيد", D: "مقبول", F: "راسب" };
const dfmtAr = s => { if (!s) return ""; const d = new Date(s + "T00:00:00"); try { return isNaN(d) ? "" : d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; } };
const dfmt = s => { if (!s) return ""; const d = new Date(s + "T00:00:00"); return isNaN(d) ? esc(s) : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); };
const SECAR = { islamic: "القسم العربي والإسلامي", western: "القسم الغربي", tech: "قسم التقنية" };

function sheet(d, g) {
  const MAX = 100, PASS = 50;
  const cd = g.card || null, mk = (cd && cd.marks) || {};
  let rows = g.subjects && g.subjects.length ? g.subjects.slice() : [];
  Object.keys(mk).forEach(k => { if (!rows.some(x => x.name === k)) rows.push({ name: k, nameAr: "" }); });
  if (!rows.length) rows = Array.from({ length: 8 }, () => ({ name: "", nameAr: "" }));
  const termTxt = d.term ? esc(d.term.name) + (d.term.session ? " " + esc(d.term.session) : "") : "";
  const f = (en, v, ar, va, w) => `<div class="f${w ? " w" : ""}"><div class="e"><b>${en}</b><span class="v">${v || ""}</span></div><div class="r" dir="rtl" lang="ar"><b class="a">${ar}</b><span class="v va">${va || ""}</span></div></div>`;
  let h = `<section class="sh"><div class="shh"><div class="a1" dir="rtl" lang="ar">معهد سراج الأمة الإسلامية</div><div class="e1">SIRAJUL UMMAH ISLAMIC INSTITUTE</div><div class="tg">For Qur’an Memorization, Arabic, Islamic and Western Studies, and Technology through Online Learning</div></div>`;
  h += `<div class="ttl"><span class="l">Report Sheet<br><small>${SEC[g.sec]}</small></span><img src="logo.svg" alt="" onerror="this.style.display='none'"><span class="r" dir="rtl">كشف الدرجات<br><small>${SECAR[g.sec]}</small></span></div>`;
  const termA = d.term ? [termAr(d.term.name), d.term.session ? AR(esc(d.term.session)) : ""].filter(Boolean).join(" ") : "";
  h += `<div class="fl">${f("Name:", esc(d.name), ":اسم", cd ? esc(cd.nameAr) : "", 1)}`
    + `${f("Term:", termTxt, ":دورة", termA, 1)}`
    + `${f("Class:", esc(g.level), ":الصف", levelAr(g.level), 1)}`
    + `${f("Position:", cd && cd.position ? esc(cd.position) : "", ":الترتيب", cd && cd.position ? AR(cd.position) : "")}`
    + `${f("Grade:", cd && cd.grade ? esc(cd.grade) : "", ":التقدير", cd && cd.grade ? (GRAR[cd.grade] || "") : "")}`
    + `${f("No of students:", cd && cd.classSize ? esc(cd.classSize) : "", ":عدد الطلاب", cd && cd.classSize ? AR(cd.classSize) : "")}`
    + `${f("Percentage:", cd && cd.percentage != null ? esc(cd.percentage) + "%" : "", ":النسبة", cd && cd.percentage != null ? AR(cd.percentage) + "٪" : "")}</div>`;
  const nm = v => v === "" || v == null ? "" : esc(v);
  const na = v => v === "" || v == null ? "" : AR(v);
  h += `<table class="sc"><colgroup><col style="width:25%"><col style="width:9.5%"><col style="width:9.5%"><col style="width:10%"><col style="width:9.5%"><col style="width:9.5%"><col style="width:10%"><col style="width:17%"></colgroup>`;
  h += `<tr><th>SUBJECT</th><th>MAX</th><th>PASS</th><th>SCORE</th><th class="ar">الميسر</th><th class="ar">النجاح</th><th class="ar">المكسوب</th><th class="ar">المواد</th></tr>`;
  h += rows.map(x => { const m = typeof mk[x.name] === "number" ? mk[x.name] : ""; const lo = m !== "" && m < PASS ? "lo" : ""; return `<tr><td class="n">${esc(x.name)}</td><td>${MAX}</td><td>${PASS}</td><td class="${lo}">${nm(m)}</td><td class="ar">${AR(MAX)}</td><td class="ar">${AR(PASS)}</td><td class="ar ${lo}">${na(m)}</td><td class="ar n">${esc(x.nameAr)}</td></tr>`; }).join("");
  const tot = cd && cd.total != null ? cd.total : "";
  h += `<tr class="tt"><td class="n">TOTAL</td><td></td><td></td><td>${nm(tot)}</td><td class="ar"></td><td class="ar"></td><td class="ar">${na(tot)}</td><td class="ar n">المجموع الكلي</td></tr></table>`;
  h += `<div class="hol">${f("HOLIDAY BEGIN:", d.term ? dfmt(d.term.endDate) : "", ":بداية العطلة", d.term ? dfmtAr(d.term.endDate) : "", 1)}${f("NEXT TERM BEGIN:", d.nextTerm ? dfmt(d.nextTerm.startDate) : "", ":الدورة الجديدة", d.nextTerm ? dfmtAr(d.nextTerm.startDate) : "", 1)}</div>`;
  const im = (u, c) => u ? `<img class="${c}" src="${u}" alt="">` : "";
  const sg = d.signs || {};
  h += `<div class="sg"><div>${im(sg.director, "sig")}DIRECTOR’S SIGN <span class="a" dir="rtl">توقيع المدير</span></div><div>${im(sg.stamp, "stp")}OFFICIAL STAMP <span class="a" dir="rtl">ختم رسمي</span></div><div>${im(g.teacherSign, "sig")}CLASS TEACHER’S SIGN <span class="a" dir="rtl">توقيع المعلم</span></div></div></section>`;
  return h;
}

export function renderReport(d) {
  const when = d.generatedAt ? new Date(d.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const sheets = d.sheets && d.sheets.length ? d.sheets : Object.keys(SEC).filter(k => d.classes && d.classes[k] && d.classes[k] !== "none").map(k => ({ sec: k, level: d.classes[k], subjects: [] }));
  let h = `<div class="rp">`;
  h += sheets.length ? sheets.map(g => sheet(d, g)).join("") : `<section class="sh"><p class="none">No class has been chosen yet.</p></section>`;
  h += `<div class="rec"><h2>Class record · سجل الفصل</h2><p class="none">Report date: ${esc(when)}</p>`;
  h += `<div class="cd2"><h3>Exam results</h3>` + (d.exams && d.exams.length ? `<table class="t"><tr><th>Course</th><th>Exam</th><th class="num">Score</th></tr>${d.exams.map(x => `<tr><td>${esc(x.course)}</td><td>${esc(x.exam)}</td><td class="num">${x.score == null ? '<span class="pill re">Awaiting marking</span>' : esc(x.score) + (x.total ? " / " + esc(x.total) : "")}</td></tr>`).join("")}</table>` : `<p class="none">No exam results for this period yet.</p>`) + `</div>`;
  h += `<div class="cd2"><h3>Attendance in class</h3>` + (d.attendance && d.attendance.length ? `<table class="t"><tr><th>Class</th><th class="num">Lectures attended</th></tr>${d.attendance.map(x => `<tr><td>${esc(x.room)}</td><td class="num">${x.attended} of ${x.total}${x.total ? " (" + Math.round(100 * x.attended / x.total) + "%)" : ""}</td></tr>`).join("")}</table>` : `<p class="none">No class attendance recorded for this period.</p>`) + `</div>`;
  h += `<div class="cd2"><h3>Memorization</h3>` + (d.progress && d.progress.length ? `<table class="t"><tr><th>Surah</th><th>Ayahs</th><th>Result</th></tr>${d.progress.map(x => `<tr><td>${esc(x.surah)}</td><td>${x.from ? esc(x.from) + "-" + esc(x.to) : ""}</td><td><span class="pill ${x.status === "passed" ? "ok" : "re"}">${x.status === "passed" ? "Passed" : "Needs revision"}</span></td></tr>`).join("")}</table>` : `<p class="none">No memorization results for this period.</p>`) + `</div>`;
  h += `<div class="cd2"><h3>Stars from the teacher</h3><div class="big">${d.stars || 0} ⭐</div></div></div>`;
  h += `<p class="ft">Sirajul Ummah Islamic Institute · sirajul-ummah.com.ng</p></div>`;
  return h;
}
