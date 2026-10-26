// Class attendance for the supervisor and admin pages.
// A lecture (session) is counted when the teacher opened the class; a student is present when he or she joined it.
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const slug = s => String(s).replace(/[^A-Za-z0-9]+/g, "-");
const ymd = sec => { const d = new Date(sec * 1000); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

export const roomIdOf = classKey => { const p = String(classKey).split("|"); return p[0] + "__" + slug(p.slice(1).join("|")); };

// term = { startDate, endDate } (optional). Returns { total, sessions, by:{uid:number}, error }
export const loadAttendance = (db, classKey, term) => loadAttendanceByRoom(db, roomIdOf(classKey), term);

// Students who have entered a classroom at least once (each student saves a roster line on entering). Returns [{uid,name}]
export async function loadRoster(db, rid) {
  try { return (await getDocs(collection(db, "classrooms", rid, "roster"))).docs.map(d => ({ uid: d.id, name: d.data().name || "Student" })); }
  catch (e) { return []; }
}

export async function loadAttendanceByRoom(db, rid, term) {
  const out = { rid, total: 0, sessions: [], by: {}, error: "" };
  try {
    let ss = (await getDocs(collection(db, "classrooms", rid, "sessions"))).docs.map(d => ({ id: d.id, ...d.data() }));
    ss = ss.filter(x => x.openedAt && x.openedAt.seconds).filter(x => { if (!term || !term.startDate || !term.endDate) return true; const d = ymd(x.openedAt.seconds); return d >= term.startDate && d <= term.endDate; });
    ss.sort((a, b) => b.openedAt.seconds - a.openedAt.seconds);
    ss = ss.slice(0, 80);
    out.total = ss.length;
    out.sessions = ss.map(x => ({ id: x.id, title: x.title || "Lecture", at: x.openedAt.seconds }));
    const lists = await Promise.all(ss.map(x => getDocs(collection(db, "classrooms", rid, "sessions", x.id, "attendance")).then(s => s.docs.map(d => d.id)).catch(() => null)));
    lists.forEach(l => { if (l === null) out.error = "Some lectures could not be read."; else l.forEach(u => { out.by[u] = (out.by[u] || 0) + 1; }); });
  } catch (e) { out.error = e.code || e.message || "error"; }
  return out;
}

const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

// HTML block for one class. studs = [{uid,name}], a = result of loadAttendance, or "loading"/undefined
export function attendanceHtml(studs, a) {
  if (a === undefined || a === "loading") return '<h3>Attendance</h3><p class="hint">Loading attendance...</p>';
  if (a.error && !a.total) return '<h3>Attendance</h3><p class="hint" style="color:#b3261e">Could not load attendance (' + esc(a.error) + ").</p>";
  if (!a.total) return '<h3>Attendance</h3><p class="hint">No lectures have been held in this class during this period yet. Attendance is counted automatically when a student joins an open class.</p>';
  const rows = studs.map(s => { const n = Math.min(a.by[s.uid] || 0, a.total); return { name: s.name, n, p: Math.round(100 * n / a.total) }; }).sort((x, y) => x.p - y.p || String(x.name).localeCompare(String(y.name)));
  const avg = rows.length ? Math.round(rows.reduce((t, r) => t + r.p, 0) / rows.length) : 0;
  const low = rows.filter(r => r.p < 50).length;
  const cls = p => p >= 80 ? "g" : p >= 50 ? "" : "r";
  const col = p => p >= 80 ? "#1c7a4d" : p >= 50 ? "#8a5a00" : "#b3261e";
  let h = '<h3>Attendance</h3><p class="hint" style="margin:0 0 8px">' + a.total + " lecture" + (a.total === 1 ? "" : "s") + " held · class average <b>" + avg + "%</b>" + (low ? ' · <b style="color:#b3261e">' + low + " student" + (low === 1 ? "" : "s") + " below 50%</b>" : "") + ". Lowest first.</p>";
  h += rows.map(r => '<div class="hw"><b>' + esc(r.name) + '</b> <span class="pill ' + cls(r.p) + '" style="color:' + col(r.p) + '">' + r.n + " of " + a.total + " · " + r.p + '%</span><div class="bar" style="margin-top:6px"><i style="width:' + r.p + '%;background:' + col(r.p) + '"></i></div></div>').join("") || '<p class="hint">No students yet.</p>';
  if (a.error) h += '<p class="hint">' + esc(a.error) + "</p>";
  const last = a.sessions.slice(0, 5).map(s => esc(s.title) + " (" + new Date(s.at * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ")").join(", ");
  h += '<p class="hint" style="margin-top:8px">Latest lectures: ' + last + "</p>";
  return h;
}
