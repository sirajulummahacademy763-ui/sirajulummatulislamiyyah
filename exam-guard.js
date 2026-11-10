/* Sirajul Ummah - Exam guard v1
   Shows the exam rules before starting, then watches the exam page.
   If the student leaves the page, minimises the browser, switches app,
   exits full screen or takes a screenshot (PrintScreen / Win+Shift+S / Cmd+Shift+3-4-5),
   the exam is submitted automatically (the page's own Submit button is pressed). */
(function () {
  if (window.__examGuard) return; window.__examGuard = 1;
  var armed = false, allowStart = false, done = false, fsOk = false;
  var RULES = [
    "Stay on this page until you submit. Do not open another app, tab or window.",
    "Do not minimise the browser, switch apps, pull down notifications or open split screen.",
    "Do not take a screenshot, screen recording or photo of the questions. Your name and the time are printed over the questions, so any leaked copy can be traced to you.",
    "Do not copy, print, save or share the questions.",
    "Do not leave full screen if your device allows it.",
    "If you break any of these rules, your exam will be SUBMITTED AUTOMATICALLY and no second chance will be given.",
    "Make sure your phone is charged, your network is good and you will not be disturbed."
  ];
  var css = document.createElement("style");
  css.textContent = "#egm,#egd{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(3,26,20,.94);font-family:Figtree,Arial,sans-serif}" +
    "#egm .bx,#egd .bx{background:#fff;color:#0a2e24;border-radius:18px;max-width:560px;width:100%;max-height:92vh;overflow:auto;padding:22px 22px 18px;box-shadow:0 20px 60px rgba(0,0,0,.5);border-top:6px solid #f0be4d}" +
    "#egm h2,#egd h2{margin:0 0 4px;font-size:1.35rem}#egm .ar{font-family:Amiri,serif;font-size:1.3rem;color:#0d6a50;margin-bottom:8px}" +
    "#egm ol{padding-left:22px;margin:10px 0}#egm li{margin:7px 0;line-height:1.4}#egm li:nth-child(6){color:#b3261e;font-weight:700}" +
    "#egm label{display:flex;gap:10px;align-items:flex-start;margin:12px 0;font-weight:700;cursor:pointer}#egm input{width:22px;height:22px;flex:none}" +
    "#egm .r,#egd .r{display:flex;gap:10px;flex-wrap:wrap}#egm button,#egd button{font:inherit;font-weight:800;border:0;border-radius:12px;padding:12px 20px;cursor:pointer}" +
    "#egm .go{background:#0d6a50;color:#fff}#egm .go:disabled{opacity:.4;cursor:not-allowed}#egm .no{background:#e9efec;color:#0a2e24}#egd button{background:#0d6a50;color:#fff}" +
    "#egd{background:rgba(120,15,10,.96)}#egd .bx{border-top-color:#b3261e}" +
    "body.eg-on{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
    "@media print{body{display:none!important}}";
  document.head.appendChild(css);

  function showRules(go) {
    var m = document.createElement("div"); m.id = "egm";
    m.innerHTML = '<div class="bx" role="dialog" aria-modal="true"><h2>Exam rules · Read before you start</h2><div class="ar" dir="rtl">قواعد الاختبار - اقرأها قبل البدء</div>' +
      '<ol>' + RULES.map(function (r) { return "<li>" + r + "</li>"; }).join("") + '</ol>' +
      '<label><input type="checkbox" id="egc"> I have read the rules and I agree to follow them.</label>' +
      '<div class="r"><button class="go" id="egg" disabled type="button">Start the exam</button><button class="no" id="egn" type="button">Not now</button></div></div>';
    document.body.appendChild(m);
    var c = m.querySelector("#egc"), g = m.querySelector("#egg");
    c.onchange = function () { g.disabled = !c.checked; };
    m.querySelector("#egn").onclick = function () { m.remove(); };
    g.onclick = function () { m.remove(); go(); };
  }

  function goFull() {
    var el = document.documentElement, f = el.requestFullscreen || el.webkitRequestFullscreen;
    try { var p = f && f.call(el); if (p && p.then) p.then(function () { fsOk = true; }, function () {}); else if (f) fsOk = true; } catch (e) {}
  }

  function findSubmit() {
    var all = document.querySelectorAll("button,input[type=submit],input[type=button],a.b,a.btn");
    for (var i = 0; i < all.length; i++) {
      var b = all[i], t = (b.textContent || b.value || "").trim();
      if (/^(submit|finish|end exam|hand in)/i.test(t) || /submit/i.test(b.id || "")) { if (b.offsetParent !== null || b.getClientRects().length) return b; }
    }
    return null;
  }

  function violate(why) {
    if (!armed || done) return; done = true; armed = false;
    try { sessionStorage.setItem("eg_reason", why); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent("exam-violation", { detail: { reason: why } })); } catch (e) {}
    var oc = window.confirm; window.confirm = function () { return true; };
    var sb = findSubmit(); if (sb) { try { sb.click(); } catch (e) {} }
    setTimeout(function () { window.confirm = oc; }, 1500);
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
    var d = document.createElement("div"); d.id = "egd";
    d.innerHTML = '<div class="bx"><h2>Your exam has been submitted</h2><p>It was submitted automatically because: <b>' + why + '</b>.</p><p>Your teacher will see this in your result.</p><div class="r"><button type="button" id="egok">OK</button></div></div>';
    document.body.appendChild(d); d.querySelector("#egok").onclick = function () { d.remove(); };
  }


  // Watermark: student name + time tiled over the questions, so any screenshot or photo can be traced back
  var wmEl = null, wmTimer = null, wmName = "";
  function wmDraw() {
    if (!wmEl) return;
    var d = new Date(), tm = d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    var txt = ((wmName || "Student") + " | " + tm + " | Sirajul Ummah").replace(/[^\x20-\x7E]/g, "?").replace(/[<&>]/g, "");
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="230"><text x="260" y="115" transform="rotate(-24 260 115)" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700" fill="#000" fill-opacity=".16" stroke="#fff" stroke-opacity=".25" stroke-width=".6">' + txt + '</text></svg>';
    wmEl.style.backgroundImage = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
  }
  function wmStart() {
    if (wmEl) return; wmEl = document.createElement("div");
    wmEl.style.cssText = "position:fixed;inset:0;z-index:2147483000;pointer-events:none;background-repeat:repeat";
    document.body.appendChild(wmEl); wmDraw(); wmTimer = setInterval(wmDraw, 20000);
    try { import("./firebase-config.js").then(function (m) {
      var n = 0, t = setInterval(function () { var u = m.auth && m.auth.currentUser; if (u) { wmName = u.displayName || u.email || u.uid; wmDraw(); clearInterval(t); } else if (++n > 40) clearInterval(t); }, 500);
    }).catch(function () {}); } catch (e) {}
  }
  function wmStop() { if (wmTimer) clearInterval(wmTimer); if (wmEl) wmEl.remove(); wmEl = null; }
  function arm() {
    armed = true; done = false; document.body.classList.add("eg-on"); wmStart();
    setTimeout(goFull, 50);
  }
  function disarm() { armed = false; wmStop(); document.body.classList.remove("eg-on"); try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) {} }

  // Start button -> rules first
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("button,a,input[type=button],input[type=submit]");
    if (!b || b.closest("#egm,#egd")) return;
    var t = (b.textContent || b.value || "").trim();
    if (!armed && !done && /^(start|begin|take|open)\b.*(exam|test|quiz)|^start$|^begin$/i.test(t)) {
      if (allowStart) { allowStart = false; setTimeout(arm, 0); return; }
      e.preventDefault(); e.stopImmediatePropagation();
      showRules(function () { allowStart = true; b.click(); });
    } else if (armed && /^(submit|finish|end exam|hand in)/i.test(t)) {
      setTimeout(disarm, 800);
    }
  }, true);

  // Leaving the page / minimising / switching apps
  document.addEventListener("visibilitychange", function () { if (document.hidden) violate("you left the exam page or minimised the browser"); });
  window.addEventListener("pagehide", function () { violate("you left the exam page"); });
  window.addEventListener("blur", function () { setTimeout(function () { if (armed && !document.hasFocus()) violate("you switched to another window or app"); }, 500); });
  document.addEventListener("fullscreenchange", function () { if (fsOk && !document.fullscreenElement) violate("you left full screen"); });
  window.addEventListener("beforeprint", function () { violate("you tried to print the page"); });

  // Screenshots and shortcuts
  function shot(e) {
    var k = e.key || "";
    return k === "PrintScreen" || k === "Snapshot" || (e.metaKey && e.shiftKey && /^[345]$/.test(k)) || (e.metaKey && e.shiftKey && /^(3|4|5|#|\$|%)$/.test(k)) || (e.shiftKey && (e.metaKey || e.getModifierState && e.getModifierState("OS")) && /^s$/i.test(k));
  }
  window.addEventListener("keydown", function (e) {
    if (!armed) return;
    if (shot(e)) { e.preventDefault(); try { navigator.clipboard.writeText(" "); } catch (x) {} return violate("a screenshot was attempted"); }
    var k = (e.key || "").toLowerCase();
    if (e.key === "F12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && /^[ijc]$/.test(k)) || ((e.ctrlKey || e.metaKey) && /^[pscu]$/.test(k))) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  window.addEventListener("keyup", function (e) { if (armed && (e.key === "PrintScreen")) { try { navigator.clipboard.writeText(" "); } catch (x) {} violate("a screenshot was attempted"); } }, true);
  ["contextmenu", "copy", "cut", "paste", "selectstart", "dragstart"].forEach(function (n) {
    document.addEventListener(n, function (e) { if (armed) { var t = e.target; if (n === "selectstart" && t && /^(input|textarea)$/i.test(t.tagName)) return; if (n === "paste" && t && /^(input|textarea)$/i.test(t.tagName)) return; e.preventDefault(); } }, true);
  });
  window.addEventListener("beforeunload", function (e) { if (armed) { e.preventDefault(); e.returnValue = ""; } });
  window.ExamGuard = { arm: arm, disarm: disarm, violate: violate, showRules: showRules };
})();
