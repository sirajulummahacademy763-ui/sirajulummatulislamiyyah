// Arranges the reciter list in library.html: Male / Female / Other languages, A to Z, with search.
// Female reciters: add API identifiers below, or add  gender: "female"  to a reciter in reciters-extra.js
(function () {
  const sel = document.getElementById("rec");
  if (!sel) return;

  const FEMALE_IDS = []; // e.g. "ar.somename"
  const extra = window.EXTRA_RECITERS || [];
  const isFemale = v => v.startsWith("x:")
    ? (extra.find(r => "x:" + r.id === v) || {}).gender === "female"
    : FEMALE_IDS.includes(v);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const box = document.createElement("input");
  box.type = "search";
  box.placeholder = "Search reciter...";
  box.setAttribute("aria-label", "Search reciter");
  box.style.cssText = "width:100%;padding:10px 12px;border:1.5px solid #cfd3e8;border-radius:8px;margin-bottom:6px;font:inherit";
  sel.parentElement.insertBefore(box, sel);

  let all = [];
  const obs = new MutationObserver(() => { capture(); draw(); });

  function capture() {
    all = [...sel.querySelectorAll("option")]
      .filter(o => o.value && !/^Loading/.test(o.textContent))
      .map(o => ({ v: o.value, t: o.textContent.trim(), other: o.parentElement.label === "Other languages" }));
  }

  function draw() {
    if (!all.length) return;
    const q = box.value.trim().toLowerCase(), cur = sel.value;
    const list = all.filter(o => o.t.toLowerCase().includes(q)).sort((a, b) => a.t.localeCompare(b.t));
    const group = (label, items) => items.length
      ? `<optgroup label="${label} (${items.length})">${items.map(o => `<option value="${esc(o.v)}">${esc(o.t)}</option>`).join("")}</optgroup>` : "";
    obs.disconnect();
    sel.innerHTML =
      group("Male reciters", list.filter(o => !o.other && !isFemale(o.v))) +
      group("Female reciters", list.filter(o => !o.other && isFemale(o.v))) +
      group("Other languages", list.filter(o => o.other)) ||
      '<option value="">No reciter found</option>';
    if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
    // While searching, show a short list so a tap always selects
    if (q) sel.setAttribute("size", "6"); else sel.removeAttribute("size");
    obs.observe(sel, { childList: true, subtree: true });
  }

  box.addEventListener("input", draw);
  capture();
  draw();
  obs.observe(sel, { childList: true, subtree: true });
})();
