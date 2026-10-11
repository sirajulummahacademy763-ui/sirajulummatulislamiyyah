// Sends a student to choose their classes if they have not done it yet,
// and loads the term and notice banner.
import "./portal.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

if (!location.pathname.endsWith("classes.html")) {
  onAuthStateChanged(auth, async u => {
    if (!u) return;
    try {
      const [ad, te, st] = await Promise.all([
        getDoc(doc(db, "admins", u.uid)),
        getDoc(doc(db, "teachers", u.uid)),
        getDoc(doc(db, "students", u.uid))
      ]);
      if (ad.exists() || te.exists() || !st.exists()) return;
      if (!st.data().classes) location.replace("classes.html");
    } catch (e) {}
  });
}
