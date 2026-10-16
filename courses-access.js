// Courses are only for: Thanawi 3 (الثالث الثانوي), SSS 3, and Advanced (Expert) in Technology
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
export const sections = c => !c ? [] : [c.islamic === "Thanawi 3" && "islamic", c.western === "SSS 3" && "western", c.tech === "Advanced" && "tech"].filter(Boolean);
export const eligible = c => !!c && (c.islamic === "Thanawi 3" || c.western === "SSS 3" || c.tech === "Advanced");
export function check() {
  return new Promise(res => onAuthStateChanged(auth, async u => {
    if (!u) return res([]);
    try { const s = await getDoc(doc(db, "students", u.uid)); res(s.exists() ? sections(s.data().classes) : []); } catch (e) { res([]); }
  }));
}
