// Help bot for Sirajul Ummah Islamic Institute (rule-based, no server needed)
(function () {
  if (document.getElementById("sbot-btn")) return;

  const KB = [
    { k: ["hello", "hi ", "hey", "salam", "assalam", "peace"], a: "Wa alaykum assalam! Welcome to Sirajul Ummah Islamic Institute. How can I help you today?", l: [] },
    { k: ["register", "sign up", "signup", "create account", "new account", "join", "account"], a: "To create a free account, open the register page, fill in your details and you are ready to learn.", l: [["Create an account", "register.html"], ["Log in", "login.html"]] },
    { k: ["password", "forgot", "reset", "cannot log", "can't log", "login", "log in"], a: "On the login page, type your email, then tap <b>Forgot your password?</b>. We will send a reset link to your email (check spam too).", l: [["Log in page", "login.html"]] },
    { k: ["course", "courses", "class", "classes", "subject", "study", "learn", "lesson"], a: "You can see all published courses on the Courses page. Open a course to read its description and price. After you unlock it with coins, all its lessons open for you.", l: [["See courses", "courses.html"]] },
    { k: ["unlock", "enrol", "enroll", "register for course", "start course", "open course"], a: "To unlock a course: open the Courses page, choose the course and tap to unlock it. The price in coins is taken from your wallet, so make sure you have enough coins first.", l: [["Courses", "courses.html"], ["My wallet", "wallet.html"]] },
    { k: ["coin", "wallet", "balance", "buy", "pay", "payment", "price", "cost", "money", "dollar", "fee", "fees", "free"], a: "Courses are paid for with coins in your wallet. <b>$1 = 10 coins</b> (for example $0.50 = 5 coins). Creating an account is free. Check your balance on the wallet page. If you have paid and your coins have not arrived, please contact us with your payment reference.", l: [["My wallet", "wallet.html"], ["Contact us", "contact.html"]] },
    { k: ["live", "zoom", "meeting", "online class", "join class", "video call", "camera", "microphone", "mic"], a: "Live classes open inside the course page. Open your course, tap the live lesson, allow camera and microphone, and join. The time is written on the lesson. Please keep your microphone muted until your teacher calls on you, and use the chat or raise hand to ask a question.", l: [["Courses", "courses.html"]] },
    { k: ["assignment", "homework", "quiz", "test", "exam", "score", "mark", "marks", "grade", "result"], a: "Assignments appear at the bottom of your course page. Answer multiple choice questions or write your answer, then submit (you can submit only once). Your score and your teacher's comment show in the same place after marking.", l: [["Courses", "courses.html"]] },
    { k: ["teacher", "ustaz", "ustadh", "question", "ask", "help me understand"], a: "Your teacher can be asked questions during the live class. For other questions, send us a message and we will pass it on.", l: [["Contact us", "contact.html"]] },
    { k: ["quran", "qur'an", "hifz", "memor", "tajweed", "recit"], a: "Our Qur'an department covers Hifz (memorization), Tajweed, recitation practice and revision. Look for these courses on the Courses page.", l: [["Qur'an courses", "courses.html?category=islamic"]] },
    { k: ["arabic", "nahw", "sarf", "grammar"], a: "Our Arabic department teaches reading and writing, vocabulary, grammar (nahw and sarf), and speaking.", l: [["See courses", "courses.html"]] },
    { k: ["islamic", "fiqh", "aqeedah", "hadith", "tafsir", "seerah", "adab"], a: "Our Islamic studies cover Aqeedah, Fiqh, Hadith and Tafsir, and Seerah and Adab.", l: [["Islamic courses", "courses.html?category=islamic"]] },
    { k: ["western", "english", "math", "mathematics", "science", "history", "social"], a: "Our Western studies cover English language, Mathematics, Sciences, and Social studies and history, taught with good values.", l: [["Western courses", "courses.html?category=western"]] },
    { k: ["tech", "technology", "computer", "coding", "programming", "web", "digital"], a: "Our Technology department covers computer and internet basics, digital safety, everyday digital tools, and web design and programming.", l: [["Technology courses", "courses.html?category=tech"]] },
    { k: ["library", "book", "books", "read", "pdf"], a: "The library has materials you can read and use alongside your courses.", l: [["Open the library", "library.html"]] },
    { k: ["about", "who are you", "institute", "school", "what is this"], a: "Sirajul Ummah Islamic Institute teaches Qur'an memorization, Arabic, Islamic and Western studies, and technology through online learning.", l: [["About us", "about.html"]] },
    { k: ["contact", "phone", "email us", "whatsapp", "address", "reach", "support", "problem", "complain", "error"], a: "You can reach us through the contact page. Tell us your name, your registered email, and what happened, and we will help.", l: [["Contact us", "contact.html"]] },
    { k: ["terms", "privacy", "copyright", "policy"], a: "You can read our rules on the Terms page and how we handle your data on the Privacy page.", l: [["Terms", "terms.html"], ["Privacy", "privacy.html"]] }
  ];

  const CHIPS = ["How do I unlock a course?", "How do coins work?", "How do live classes work?", "Where are my scores?", "Contact the institute"];

  const css = document.createElement("style");
  css.textContent = `
#sbot-btn{position:fixed;right:16px;bottom:16px;z-index:9999;width:58px;height:58px;border-radius:50%;border:2px solid #f5b94a;background:#12163a;color:#f5b94a;font-size:26px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35)}
#sbot-box{position:fixed;right:16px;bottom:86px;z-index:9999;width:min(360px,calc(100vw - 32px));height:min(520px,calc(100vh - 120px));background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.35);display:none;flex-direction:column;overflow:hidden;font-family:Figtree,system-ui,sans-serif;color:#171a33}
#sbot-box.open{display:flex}
#sbot-head{background:#12163a;color:#fff;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;font-weight:700}
#sbot-head button{background:none;border:0;color:#f5b94a;font-size:22px;cursor:pointer}
#sbot-log{flex:1;overflow-y:auto;padding:12px;background:#eef0f8}
.sb-m{max-width:88%;margin:0 0 10px;padding:10px 12px;border-radius:12px;line-height:1.45;font-size:.95rem}
.sb-b{background:#fff;border:1px solid #cfd3e8}
.sb-u{background:#12163a;color:#fff;margin-left:auto}
.sb-m a{display:inline-block;margin:6px 6px 0 0;padding:6px 12px;background:#f5b94a;color:#12163a;border-radius:8px;font-weight:700;text-decoration:none;font-size:.9rem}
#sbot-chips{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;background:#eef0f8;border-top:1px solid #cfd3e8}
#sbot-chips button{border:1.5px solid #cfd3e8;background:#fff;border-radius:999px;padding:6px 12px;font:inherit;font-size:.82rem;cursor:pointer;color:#12163a}
#sbot-form{display:flex;gap:8px;padding:10px;border-top:1px solid #cfd3e8;background:#fff}
#sbot-in{flex:1;padding:10px;border:1.5px solid #cfd3e8;border-radius:8px;font:inherit}
#sbot-form button{border:0;border-radius:8px;background:#12163a;color:#fff;font-weight:700;padding:0 16px;cursor:pointer}`;
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.id = "sbot-btn"; btn.type = "button"; btn.setAttribute("aria-label", "Open help"); btn.textContent = "💬";
  const box = document.createElement("div");
  box.id = "sbot-box";
  box.innerHTML = '<div id="sbot-head"><span>Help assistant</span><button type="button" id="sbot-x" aria-label="Close">&times;</button></div><div id="sbot-log"></div><div id="sbot-chips"></div><form id="sbot-form"><input id="sbot-in" placeholder="Type your question..." autocomplete="off"><button type="submit">Send</button></form>';
  document.body.appendChild(btn); document.body.appendChild(box);

  const log = box.querySelector("#sbot-log"), inp = box.querySelector("#sbot-in");

  function add(html, who) {
    const d = document.createElement("div");
    d.className = "sb-m " + (who === "u" ? "sb-u" : "sb-b");
    if (who === "u") d.textContent = html; else d.innerHTML = html;
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }

  function answer(q) {
    const t = " " + q.toLowerCase() + " ";
    let best = null, score = 0;
    KB.forEach(e => {
      const s = e.k.filter(w => t.includes(w)).length;
      if (s > score) { score = s; best = e; }
    });
    if (!best) return 'I am not sure about that. Try one of the buttons below, or send us a message and a person will help you.<br><a href="contact.html">Contact us</a>';
    return best.a + (best.l.length ? "<br>" + best.l.map(x => '<a href="' + x[1] + '">' + x[0] + "</a>").join("") : "");
  }

  function ask(q) {
    q = q.trim(); if (!q) return;
    add(q, "u");
    setTimeout(() => add(answer(q), "b"), 250);
  }

  box.querySelector("#sbot-chips").innerHTML = CHIPS.map(c => '<button type="button">' + c + "</button>").join("");
  box.querySelectorAll("#sbot-chips button").forEach(b => b.onclick = () => ask(b.textContent));
  box.querySelector("#sbot-form").onsubmit = e => { e.preventDefault(); ask(inp.value); inp.value = ""; };
  box.querySelector("#sbot-x").onclick = () => box.classList.remove("open");
  btn.onclick = () => {
    box.classList.toggle("open");
    if (box.classList.contains("open") && !log.children.length) add("Assalamu alaykum! I am the institute's help assistant. Ask me about courses, coins, live classes, assignments, or tap a button below.", "b");
  };
})();
