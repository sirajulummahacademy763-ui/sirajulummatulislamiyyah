import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-config.js";

// Only signed-in students may see the page. Everyone else goes to the login page.
onAuthStateChanged(auth, user => {
  if (user) document.documentElement.classList.add("ok");
  else location.replace("login.html");
});

// Any element with data-logout signs the student out.
document.addEventListener("click", e => {
  if (e.target.closest("[data-logout]")) {
    e.preventDefault();
    signOut(auth).then(() => location.href = "login.html");
  }
});
