import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-config.js";

// Pages anyone can open without logging in (so Google can find them).
const PUBLIC_PAGES = ["", "index.html", "about.html", "contact.html", "privacy.html", "terms.html"];
// Links that only make sense for signed-in students. They are hidden from visitors.
const MEMBER_LINKS = ["wallet.html", "exams.html", "certificate.html", "teacher.html", "admin.html"];

const page = location.pathname.split("/").pop();
const isPublic = PUBLIC_PAGES.includes(page);
const root = document.documentElement;

// Public pages show straight away.
if (isPublic) root.classList.add("ok");

let signedIn = null; // null = not known yet

// For visitors who are not logged in, replace "Log out" with "Log in" and "Create account".
// It is safe to run many times: it only changes things that still need changing.
function fixNav() {
  if (!isPublic || signedIn !== false) return;

  document.querySelectorAll("[data-logout]").forEach(el => {
    el.removeAttribute("data-logout");
    el.textContent = "Log in";
    el.setAttribute("href", "login.html");
    if (!document.querySelector(".create-link") && el.parentNode) {
      const a = document.createElement("a");
      a.className = "create-link";
      a.href = "register.html";
      a.textContent = "Create account";
      el.parentNode.insertBefore(a, el);
    }
  });

  document.querySelectorAll("nav a").forEach(a => {
    const target = (a.getAttribute("href") || "").split("?")[0].split("/").pop();
    if (MEMBER_LINKS.includes(target) && !a.hidden) a.hidden = true;
  });
}

onAuthStateChanged(auth, user => {
  signedIn = !!user;
  if (user) root.classList.add("ok");
  else if (!isPublic) location.replace("login.html"); // locked pages still need a login
  fixNav();
});

// Some pages build their menu after loading, so check again whenever the page changes.
if (isPublic) new MutationObserver(fixNav).observe(root, { childList: true, subtree: true });

// Any element with data-logout signs the student out.
document.addEventListener("click", e => {
  if (e.target.closest("[data-logout]")) {
    e.preventDefault();
    signOut(auth).then(() => location.href = "login.html");
  }
});
