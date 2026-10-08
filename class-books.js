// Adds "Class books" (2 coins each) above the free catalog in library.html
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { auth, db } from "./firebase-config.js";
import { BOOKS, BOOK_PRICE } from "./library-data.js";

const MAP = { books: "arabic", western: "western", tech: "tech" };
const cat = new URLSearchParams(location.search).get("category");
const dept = MAP[cat];
const anchor = dept && document.getElementById("cat-" + cat);

if (anchor) {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const box = document.createElement("div");
  box.innerHTML = `<h3>Class books</h3><p class="hnote" id="cbNote"></p><div id="cbList"></div>
    <h3 style="margin-top:28px">Free books from around the world</h3>`;
  anchor.insertAdjacentElement("beforebegin", box);
  const note = box.querySelector("#cbNote"), list = box.querySelector("#cbList");

  let user = null, coins = 0, unlocked = new Set(), msg = "";

  const draw = () => {
    list.innerHTML = BOOKS.filter(b => b.dept === dept).map(b => `<div class="bk"><div><b>${esc(b.level)}</b><span>PDF book · ${BOOK_PRICE} coins to unlock</span></div>${
      unlocked.has(b.id)
        ? `<button type="button" class="btn" data-open="${b.id}">Open PDF</button>`
        : `<button type="button" class="btn" data-unlock="${b.id}" data-name="${esc(b.level)}">Unlock</button>`}</div>`).join("");
    note.textContent = msg || (user ? `Your coins: ${coins}` : "Log in to unlock class books.");
  };

  list.addEventListener("click", async e => {
    const u = e.target.closest("[data-unlock]"), o = e.target.closest("[data-open]");
    if (u) {
      if (!user) return location.href = "login.html";
      if (!confirm(`Unlock ${u.dataset.name} for ${BOOK_PRICE} coins?`)) return;
      u.disabled = true; u.textContent = "Unlocking...";
      try {
        await httpsCallable(getFunctions(), "unlockBook")({ bookId: u.dataset.unlock });
        msg = "Book unlocked.";
      } catch (err) {
        msg = err.code === "functions/failed-precondition" ? "Not enough coins. Buy coins in My wallet." : "Could not unlock. Try again.";
      }
      draw(); setTimeout(() => { msg = ""; draw(); }, 4000);
    }
    if (o) {
      try {
        const url = await getDownloadURL(ref(getStorage(), `books/${o.dataset.open}.pdf`));
        window.open(url, "_blank") || (location.href = url);
      } catch { msg = "This book has not been uploaded yet."; draw(); setTimeout(() => { msg = ""; draw(); }, 4000); }
    }
  });

  onAuthStateChanged(auth, u => {
    user = u;
    if (!u) { unlocked = new Set(); coins = 0; return draw(); }
    onSnapshot(doc(db, "students", u.uid), s => { coins = s.data()?.coins ?? 0; draw(); });
    onSnapshot(collection(db, "students", u.uid, "unlocked"), s => { unlocked = new Set(s.docs.map(d => d.id)); draw(); });
  });
  draw();
}
