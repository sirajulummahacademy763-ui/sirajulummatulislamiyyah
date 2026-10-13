// Siraj Assistant - AI help bot for Sirajul Ummah Islamic Institute
(function () {
  if (document.getElementById("sb-fab")) return;
  // After you deploy the Cloudflare Worker, paste its address here (no slash at the end):
  const BOT_URL = "https://sirajul-botc.sirajulummahacademy763.workers.dev";

  const SK = "sbChat", CK = "sbCtx";
  let lang = "en"; try { lang = localStorage.getItem("siteLang") === "ar" ? "ar" : "en"; } catch (e) {}
  const TX = {
    en: {
      title: "Siraj Assistant", sub: "AI help · knows the whole site", ph: "Ask me anything...", fab: "Ask Siraj",
      hello: "Assalamu alaikum! 👋 I'm Siraj, the institute's AI assistant. I can help with your courses, coins, classes, exams, the library and anything on this site. What would you like to know?",
      chips: ["How many coins do I have?", "Is my classroom open now?", "Which courses are for my class?", "How do I buy coins?", "When is my next class?", "How do exams work?"],
      err: "Sorry, I could not reach the assistant. Please check your internet and try again.",
      note: "AI can make mistakes. For payments or grades, contact the institute.", fresh: "New chat", close: "Close"
    },
    ar: {
      title: "مساعد سراج", sub: "مساعد ذكي · يعرف كل الموقع", ph: "اسألني أي سؤال...", fab: "اسأل سراج",
      hello: "السلام عليكم ورحمة الله! 👋 أنا سراج، المساعد الذكي للمعهد. أستطيع مساعدتك في الدورات والعملات والفصول والاختبارات والمكتبة وكل ما في الموقع. بماذا أساعدك؟",
      chips: ["كم عملة لدي؟", "هل فصلي مفتوح الآن؟", "ما الدورات المناسبة لفصلي؟", "كيف أشتري العملات؟", "متى حصتي القادمة؟", "كيف تعمل الاختبارات؟"],
      err: "عذرًا، تعذر الوصول إلى المساعد. تحقق من الإنترنت وحاول مرة أخرى.",
      note: "الذكاء الاصطناعي قد يخطئ. للمدفوعات أو الدرجات تواصل مع المعهد.", fresh: "محادثة جديدة", close: "إغلاق"
    }
  }[lang];

  const css = document.createElement("style");
  css.textContent = `
#sb-root,#sb-root *{box-sizing:border-box}
#sb-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9998;height:56px;padding:0 20px 0 16px;border-radius:28px;border:0;background:linear-gradient(135deg,#f7c660,#e59d1c);color:#12163a;font:700 15px Figtree,system-ui,sans-serif;display:flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer}
#sb-fab svg{width:24px;height:24px;flex:none}
#sb-panel{position:fixed;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:9999;width:min(400px,calc(100vw - 24px));height:min(640px,calc(100vh - 110px));height:min(640px,calc(100dvh - 110px));display:none;flex-direction:column;border-radius:22px;overflow:hidden;background:#f3f4fa;box-shadow:0 14px 44px rgba(0,0,0,.45);font-family:Figtree,system-ui,sans-serif;color:#171a33}
#sb-panel.open{display:flex}
.sb-h{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 16px;background:linear-gradient(135deg,#12163a,#232a78);color:#fff}
.sb-av{flex:none;width:42px;height:42px;border-radius:50%;background:#f5b94a;color:#12163a;display:grid;place-items:center;font:700 24px Amiri,serif}
.sb-ht{flex:1;min-width:0}.sb-ht b{display:block;font-size:16px}.sb-ht span{font-size:12px;color:#c9ccf0;display:flex;align-items:center;gap:6px}
.sb-ht span:before{content:"";width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block}
.sb-ib{flex:none;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:18px;cursor:pointer}
.sb-l{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
.sb-b{max-width:88%;padding:10px 14px;border-radius:18px;line-height:1.55;font-size:15px;word-wrap:break-word;overflow-wrap:anywhere}
.sb-b.bot{align-self:flex-start;background:#fff;border-bottom-left-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.sb-b.me{align-self:flex-end;background:#12163a;color:#fff;border-bottom-right-radius:6px}
.sb-b a{color:#0b57d0;font-weight:700;text-decoration:underline}
.sb-b ul{margin:6px 0;padding-left:20px}.sb-b li{margin:2px 0}
.sb-t{align-self:flex-start;background:#fff;border-radius:18px;border-bottom-left-radius:6px;padding:12px 16px;display:flex;gap:5px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.sb-t i{width:8px;height:8px;border-radius:50%;background:#9aa0c8;animation:sbd 1.2s infinite}.sb-t i:nth-child(2){animation-delay:.2s}.sb-t i:nth-child(3){animation-delay:.4s}
@keyframes sbd{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
.sb-c{display:flex;gap:8px;overflow-x:auto;padding:0 14px 10px;scrollbar-width:none}.sb-c::-webkit-scrollbar{display:none}
.sb-c button{flex:none;border:1.5px solid #d5d8ee;background:#fff;border-radius:999px;padding:8px 14px;font:inherit;font-size:13.5px;color:#12163a;cursor:pointer;white-space:nowrap}
.sb-f{display:flex;align-items:flex-end;gap:8px;padding:10px 12px 6px;background:#fff;border-top:1px solid #e3e5f1}
.sb-f textarea{flex:1;resize:none;border:1.5px solid #d5d8ee;border-radius:20px;padding:10px 14px;font:inherit;font-size:15px;max-height:110px;outline:none;background:#f8f9fe}
.sb-f textarea:focus{border-color:#f5b94a}
.sb-f button{flex:none;width:44px;height:44px;border-radius:50%;border:0;background:#12163a;color:#f5b94a;cursor:pointer;display:grid;place-items:center}
.sb-f button svg{width:20px;height:20px}
.sb-n{background:#fff;text-align:center;font-size:11px;color:#7b80a6;padding:0 12px 8px}
@media(max-width:480px){#sb-panel{right:0;left:0;bottom:0;width:100%;height:88vh;height:88dvh;border-radius:22px 22px 0 0}#sb-fab span{display:none}#sb-fab{padding:0 16px}}`;
  document.head.appendChild(css);

  const root = document.createElement("div");
  root.id = "sb-root"; root.setAttribute("translate", "no"); root.className = "notranslate";
  root.innerHTML = `<button id="sb-fab" type="button" aria-label="${TX.fab}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/><path d="M9 11h6M9 14h4"/></svg><span>${TX.fab}</span></button>
  <div id="sb-panel" role="dialog" aria-label="${TX.title}">
    <div class="sb-h"><div class="sb-av">س</div><div class="sb-ht"><b>${TX.title}</b><span>${TX.sub}</span></div>
      <button class="sb-ib" id="sb-new" type="button" title="${TX.fresh}" aria-label="${TX.fresh}">↺</button><button class="sb-ib" id="sb-x" type="button" title="${TX.close}" aria-label="${TX.close}">✕</button></div>
    <div class="sb-l" id="sb-log"></div><div class="sb-c" id="sb-chips"></div>
    <form class="sb-f" id="sb-form"><textarea id="sb-in" rows="1" maxlength="500" placeholder="${TX.ph}" dir="auto"></textarea>
      <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg></button></form>
    <div class="sb-n">${TX.note}</div></div>`;
  document.body.appendChild(root);

  const $ = id => document.getElementById(id), log = $("sb-log"), inp = $("sb-in"), panel = $("sb-panel");
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  let hist = []; try { hist = JSON.parse(sessionStorage.getItem(SK) || "[]"); } catch (e) {}
  let ctxP = null, busy = false;

  function md(s) {
    s = esc(s)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => /^(https?:\/\/|[\w\-.\/]+\.html([?#]\S*)?$)/.test(u) ? `<a href="${u}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ""}>${t}</a>` : t)
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    let out = "", inl = false;
    s.split("\n").forEach(ln => {
      const m = ln.match(/^\s*[-•*]\s+(.*)/);
      if (m) { if (!inl) { out += "<ul>"; inl = true; } out += "<li>" + m[1] + "</li>"; }
      else { if (inl) { out += "</ul>"; inl = false; } if (ln.trim()) out += ln + "<br>"; }
    });
    if (inl) out += "</ul>";
    return out.replace(/(<br>)+$/, "");
  }
  function bubble(text, who) {
    const d = document.createElement("div"); d.className = "sb-b " + who; d.setAttribute("dir", "auto");
    if (who === "me") d.textContent = text; else d.innerHTML = md(text);
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  const save = () => { try { sessionStorage.setItem(SK, JSON.stringify(hist.slice(-20))); } catch (e) {} };
  function typing(on) {
    const old = $("sb-typing"); if (old) old.remove();
    if (on) { const t = document.createElement("div"); t.className = "sb-t"; t.id = "sb-typing"; t.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(t); log.scrollTop = log.scrollHeight; }
  }
  function render() {
    log.innerHTML = ""; bubble(TX.hello, "bot");
    hist.forEach(m => bubble(m.content, m.role === "user" ? "me" : "bot"));
    $("sb-chips").style.display = hist.length ? "none" : "flex";
  }
  $("sb-chips").innerHTML = TX.chips.map(c => `<button type="button">${esc(c)}</button>`).join("");
  $("sb-chips").querySelectorAll("button").forEach(b => b.onclick = () => ask(b.textContent));

  // ---- What the assistant knows about this visitor and the site right now
  async function buildCtx() {
    const c = { lang, page: location.pathname.split("/").pop() || "index.html", pageTitle: document.title };
    try {
      const [a, f, cf] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
        import("./firebase-config.js")
      ]);
      const u = cf.auth.currentUser || await new Promise(r => { const un = a.onAuthStateChanged(cf.auth, x => { un(); r(x); }); });
      if (!u) return c;
      const db = cf.db, g = async fn => { try { return await fn(); } catch (e) { return null; } };
      const slug = s => String(s).replace(/[^A-Za-z0-9]+/g, "-");
      const [st, ad, te] = await Promise.all([g(() => f.getDoc(f.doc(db, "students", u.uid))), g(() => f.getDoc(f.doc(db, "admins", u.uid))), g(() => f.getDoc(f.doc(db, "teachers", u.uid)))]);
      const s = st && st.exists() ? st.data() : {};
      c.user = { name: s.name || "", coins: s.coins == null ? null : s.coins, classes: s.classes || null, role: ad && ad.exists() ? "admin" : te && te.exists() ? "teacher" : "student" };
      const cs = await g(() => f.getDocs(f.query(f.collection(db, "courses"), f.where("published", "==", true))));
      const cmap = {};
      if (cs) c.courses = cs.docs.slice(0, 60).map(d => { const x = d.data(); cmap[d.id] = x.title; return { title: String(x.title || "").slice(0, 60), section: x.section, level: x.level, priceCoins: x.price || 0, type: x.kind === "book" ? "book" : "course", teacher: x.teacherName || "" }; });
      const en = await g(() => f.getDocs(f.query(f.collection(db, "enrollments"), f.where("uid", "==", u.uid))));
      if (en) c.unlockedCourses = en.docs.map(d => cmap[d.data().courseId]).filter(Boolean);
      const tm = await g(() => f.getDocs(f.collection(db, "terms")));
      if (tm) { const t = new Date(), ds = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0"); const cur = tm.docs.map(d => d.data()).find(x => ds >= x.startDate && ds <= x.endDate); if (cur) c.currentTerm = { name: cur.name, session: cur.session, begins: cur.startDate, ends: cur.endDate }; }
      const an = await g(() => f.getDocs(f.collection(db, "announcements")));
      if (an) c.notices = an.docs.map(d => d.data()).sort((x, y) => (y.createdAt ? y.createdAt.seconds : 0) - (x.createdAt ? x.createdAt.seconds : 0)).slice(0, 5).map(x => ({ title: x.title, text: String(x.body || "").slice(0, 200) }));
      const rooms = [];
      if (s.classes) for (const sec of Object.keys(s.classes)) {
        const lv = s.classes[sec]; if (!lv || lv === "none") continue;
        const r = await g(() => f.getDoc(f.doc(db, "classrooms", sec + "__" + slug(lv))));
        if (r && r.exists()) { const x = r.data(); rooms.push({ classroom: x.title, status: x.status === "open" ? "OPEN now" : "closed", teacher: x.teacherName, days: (x.schedDays || []).map(i => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]).join(", "), time: x.schedTime || "" }); }
      }
      c.myClassrooms = rooms;
    } catch (e) {}
    return c;
  }
  function getCtx() {
    try { const x = JSON.parse(sessionStorage.getItem(CK) || "null"); if (x && Date.now() - x.t < 300000 && x.page === location.pathname) return Promise.resolve(x.c); } catch (e) {}
    if (!ctxP) ctxP = buildCtx().then(c => { try { sessionStorage.setItem(CK, JSON.stringify({ t: Date.now(), page: location.pathname, c })); } catch (e) {} ctxP = null; return c; });
    return ctxP;
  }

  async function ask(q) {
    q = String(q || "").trim(); if (!q || busy) return;
    busy = true; $("sb-chips").style.display = "none";
    bubble(q, "me"); hist.push({ role: "user", content: q }); save(); typing(true);
    try {
      const ctx = await Promise.race([getCtx(), new Promise(r => setTimeout(() => r({ lang }), 5000))]);
      const r = await fetch(BOT_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: hist.slice(-8), context: ctx }) });
      const d = await r.json(); typing(false);
      const reply = d.reply || TX.err; bubble(reply, "bot"); hist.push({ role: "assistant", content: reply });
    } catch (e) { typing(false); bubble(TX.err, "bot"); hist.pop(); }
    save(); busy = false;
  }

  $("sb-form").onsubmit = e => { e.preventDefault(); const v = inp.value; inp.value = ""; inp.style.height = "auto"; ask(v); };
  inp.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("sb-form").requestSubmit(); } };
  inp.oninput = () => { inp.style.height = "auto"; inp.style.height = Math.min(inp.scrollHeight, 110) + "px"; };
  $("sb-new").onclick = () => { hist = []; save(); render(); };
  $("sb-x").onclick = () => panel.classList.remove("open");
  $("sb-fab").onclick = () => { panel.classList.toggle("open"); if (panel.classList.contains("open")) { getCtx(); setTimeout(() => inp.focus(), 150); } };
  render();
})();
