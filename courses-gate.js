// Add to courses.html:  <script type="module" src="courses-gate.js"></script>
// Shows only the course categories the student qualifies for
import { check } from "./courses-access.js";
check().then(ok => {
  if (!ok.length) return location.replace("subjects.html");
  const run = () => {
    document.querySelectorAll("[data-cat]").forEach(el => { if (!ok.includes(el.dataset.cat)) el.hidden = true; });
    document.querySelectorAll(".tabs a[data-t]").forEach(a => { if (a.dataset.t && !ok.includes(a.dataset.t)) a.hidden = true; });
  };
  run();
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
});
