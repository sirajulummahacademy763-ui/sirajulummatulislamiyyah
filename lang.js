// Language choice for Sirajul Ummah Islamic Institute: English or Arabic.
// The first time someone opens the site they are asked. The choice is remembered on that phone.
// Arabic uses Google's free page translator and switches the page to right-to-left.
(function () {
  const KEY = "siteLang", host = location.hostname;
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) {}
  const setCk = v => ["", "; domain=" + host, "; domain=." + host].forEach(d => {
    document.cookie = "googtrans=" + (v || "") + "; path=/" + d + (v ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });
  const st = document.createElement("style");
  st.textContent = ".goog-te-banner-frame,.goog-te-balloon-frame,#goog-gt-tt,.goog-te-gadget-icon,body>.skiptranslate{display:none!important}" +
    "body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}font{vertical-align:inherit}" +
    "html[lang=ar] body{font-family:Amiri,Tahoma,sans-serif}";
  document.head.appendChild(st);

  function applyDir(l) { document.documentElement.lang = l; document.documentElement.dir = l === "ar" ? "rtl" : "ltr"; }
  function loadTranslator() {
    const d = document.createElement("div"); d.id = "google_translate_element"; d.style.display = "none"; document.body.appendChild(d);
    window.googleTranslateElementInit = () => { new google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "ar,en", autoDisplay: false }, "google_translate_element"); };
    const s = document.createElement("script"); s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"; document.body.appendChild(s);
  }
  function choose(l) {
    const was = lang;
    lang = l; try { localStorage.setItem(KEY, l); } catch (e) {}
    if (l === "ar") { setCk("/en/ar"); location.reload(); return; }
    setCk(""); applyDir("en");
    if (was === "ar") { location.reload(); return; }
    const m = document.getElementById("lang-modal"); if (m) m.remove();
    button();
  }
  function button() {
    const old = document.querySelector("[data-langbtn]"); if (old) old.remove();
    const a = document.createElement("a");
    a.href = "#"; a.setAttribute("data-langbtn", ""); a.setAttribute("translate", "no"); a.className = "notranslate";
    a.textContent = lang === "ar" ? "English" : "العربية";
    a.onclick = e => { e.preventDefault(); choose(lang === "ar" ? "en" : "ar"); };
    const nv = document.querySelector("header.top nav");
    if (nv) nv.insertBefore(a, nv.querySelector("[data-logout]") || null);
    else { a.style.cssText = "position:fixed;top:10px;right:10px;z-index:9999;background:#f5b94a;color:#12163b;padding:6px 14px;border-radius:20px;font-weight:700;text-decoration:none;font-family:sans-serif"; document.body.appendChild(a); }
  }
  function modal() {
    const m = document.createElement("div"); m.id = "lang-modal"; m.setAttribute("translate", "no"); m.className = "notranslate";
    m.style.cssText = "position:fixed;inset:0;background:rgba(18,22,59,.94);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px";
    m.innerHTML = '<div style="background:#fff;border-radius:18px;max-width:420px;width:100%;padding:28px 22px;text-align:center;font-family:Figtree,system-ui,sans-serif;color:#12163b">' +
      '<div style="font-family:Amiri,serif;font-size:1.5rem;color:#b8860b" dir="rtl" lang="ar">معهد سراج الأمة الإسلامية</div>' +
      '<div style="font-weight:700;margin:2px 0 18px">Sirajul Ummah Islamic Institute</div>' +
      '<h2 style="margin:0 0 6px;font-size:1.3rem">Choose your language</h2>' +
      '<h2 style="margin:0 0 20px;font-family:Amiri,serif;font-size:1.5rem" dir="rtl" lang="ar">اختر لغتك</h2>' +
      '<button data-l="en" style="display:block;width:100%;padding:16px;margin-bottom:12px;border:0;border-radius:12px;background:#12163b;color:#fff;font:inherit;font-weight:700;font-size:1.2rem;cursor:pointer">English</button>' +
      '<button data-l="ar" style="display:block;width:100%;padding:16px;border:0;border-radius:12px;background:#f5b94a;color:#12163b;font-family:Amiri,serif;font-weight:700;font-size:1.5rem;cursor:pointer">العربية</button></div>';
    document.body.appendChild(m);
    m.querySelectorAll("[data-l]").forEach(b => b.onclick = () => choose(b.dataset.l));
  }
  function start() {
    if (lang === "ar") { applyDir("ar"); loadTranslator(); }
    button();
    if (!lang) modal();
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
