// Shows each student only the syllabus book of their own class in the library shelves.
// Qur'an, Hadith and the free worldwide books are not touched.
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const C = new URLSearchParams(location.search).get("category");

if (["islamic", "western", "tech"].includes(C)) {
  onAuthStateChanged(auth, async u => {
    if (!u) return;
    let cls = null;
    try { cls = (await getDoc(doc(db, "students", u.uid))).data().classes || null; } catch (e) {}
    if (!cls) return;
    const box = document.getElementById("shelf-" + C);
    if (!box) return;
    const want = cls[C];

    const apply = () => {
      const tb = box.querySelector("tbody");
      if (!tb || tb.dataset.f === "1") return;
      tb.dataset.f = "1";
      let cur = null;
      tb.querySelectorAll("tr").forEach(tr => {
        const cl = tr.querySelector("td.cl");
        if (cl) cur = (cl.firstChild ? cl.firstChild.textContent : "").trim();
        tr.style.display = want !== "none" && cur === want ? "" : "none";
      });
      const t = tb.closest("table");
      if (t) {
        t.insertAdjacentHTML("afterend", want === "none"
          ? '<p class="hnote">You did not choose this section.</p>'
          : '<p class="hnote">Showing the book for your class: <b>' + want.replace(/[<>&]/g, "") + "</b>. To change your class, please contact the institute.</p>");
      }
    };

    new MutationObserver(apply).observe(box, { childList: true, subtree: true });
    apply();
  });
}
