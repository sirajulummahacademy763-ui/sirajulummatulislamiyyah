// Pages anyone can open without logging in (written without ".html", because Netlify can show /about instead of /about.html)
const PUBLIC=["about","contact","privacy","terms"];
const page=(location.pathname.split("/").pop()||"index").replace(/\.html$/,"");
const isPub=PUBLIC.includes(page);
if(isPub)document.documentElement.classList.add("ok");else import("./guard.js").catch(()=>location.replace("login.html"));
const nav=isPub?[["index.html","Home"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"],["login.html","Log in"]]:[["index.html","Home"],["subjects.html","Subjects"],["timetable.html","Timetable"],["library.html","Library"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"],["wallet.html","My wallet"]];
const cta=isPub?'<a class="btn" href="register.html">Join free</a>':'<a class="btn" href="#" data-logout>Log out</a>';
if(!document.querySelector('link[rel=icon]'))document.head.insertAdjacentHTML("beforeend",'<link rel="icon" href="logo.svg">');
document.body.insertAdjacentHTML("afterbegin",
 '<header class="top"><a class="logo" href="index.html" style="display:flex;align-items:center;gap:10px"><img src="logo.svg" alt="" width="40" height="40"><span style="display:block;line-height:1.25"><span dir="rtl" lang="ar" style="display:block;font-family:Amiri,serif;font-size:1.15em">معهد سراج الأمة الإسلامية</span>Sirajul Ummah Islamic Institute</span></a><button class="mb" type="button" aria-expanded="false" aria-controls="mainnav">\u2630 Menu</button><nav id="mainnav">'+
 nav.map(n=>'<a href="'+n[0]+'">'+n[1]+'</a>').join("")+
 cta+'</nav></header>');
document.body.insertAdjacentHTML("beforeend",
 '<footer><div style="max-width:560px"><span dir="rtl" lang="ar" style="display:block;font-family:Amiri,serif;font-size:1.2rem;color:#f5b94a">معهد سراج الأمة الإسلامية لتحفيظ القرآن ودراسة العلوم العربية والإسلامية والغربية والتقنية عبر الإنترنت</span><b>Sirajul Ummah Islamic Institute</b><br>For Qur\u2019an Memorization, Arabic, Islamic and Western Studies, and Technology through Online Learning.</div>'+
 '<div><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="contact.html">Contact</a><a href="donate.html">Donate</a></div></footer>');
const cat=new URLSearchParams(location.search).get("category");
document.querySelectorAll("[data-cat]").forEach(el=>{if(cat&&el.dataset.cat!==cat)el.hidden=true});
document.querySelectorAll(".tabs a").forEach(a=>{if((a.dataset.t||"")===(cat||""))a.classList.add("on")});
// Use "Institute" everywhere
document.title=document.title.replace(/Sirajul Ummah Academy/g,"Sirajul Ummah Islamic Institute");
(function(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){n.nodeValue=n.nodeValue.replace(/\bthe academy\b/g,"the institute").replace(/\bacademy services\b/g,"institute services").replace(/\bAcademy\b/g,"Institute")}})();
// Show "Admin" and "Teacher" links only to the people who have those roles
if(!isPub){
  Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
    import("./firebase-config.js")
  ]).then(([a,f,c])=>{
    a.onAuthStateChanged(c.auth,async u=>{
      if(!u||document.querySelector("[data-role-link]"))return;
      const nv=document.querySelector("header.top nav");
      const add=(href,text)=>{
        const l=document.createElement("a");
        l.href=href;l.textContent=text;l.setAttribute("data-role-link","");
        nv.insertBefore(l,nv.querySelector("[data-logout]"));
      };
      try{ if((await f.getDoc(f.doc(c.db,"admins",u.uid))).exists()){add("admin.html","Admin");add("revision-admin.html","Hifz & Revision (admin)");add("classes-admin.html","Classes & Timetable (admin)");add("countries-admin.html","Students & Teachers by Country (admin)");add("revision-choices-admin.html","Hifz & Revision choices (admin)");} }catch(e){}
      try{ if((await f.getDoc(f.doc(c.db,"teachers",u.uid))).exists())add("teacher.html","Teacher"); }catch(e){}
    });
  }).catch(()=>{});
}
// Copyright line on every page
document.body.insertAdjacentHTML("beforeend",
 '<div style="background:var(--night,#12163b);color:#c9ccdf;text-align:center;padding:14px 16px;font-size:.85rem;border-top:1px solid rgba(255,255,255,.12)">&copy; '+new Date().getFullYear()+' Sirajul Ummah Islamic Institute. All rights reserved.<br>Website developed with Alpha Tech Hub</div>');
// Help bot
if(!isPub){const bs=document.createElement("script");bs.src="bot.js";document.body.appendChild(bs);}
// Exams, certificates and classroom links
if(!isPub){const nv=document.querySelector("header.top nav"),lo=nv.querySelector("[data-logout]");[["exams.html","Exams"],["certificate.html","Certificates"],["classroom.html","Classroom"],["revision.html","Hifz & Revision"]].forEach(n=>{const a=document.createElement("a");a.href=n[0];a.textContent=n[1];nv.insertBefore(a,lo)})}
if(!isPub)import("./classes-check.js");
if(!isPub){const nv=document.querySelector("header.top nav"),lo=nv&&nv.querySelector("[data-logout]");if(nv&&!nv.querySelector('a[href="classroom.html"]')){const a=document.createElement("a");a.href="classroom.html";a.textContent="Classroom";nv.insertBefore(a,lo)}}
if(!isPub)import("./notice-popup.js?v=5").catch(()=>{});
// Courses link: hidden unless the student is in Thanawi 3, SSS 3 or Advanced Technology
if(!document.getElementById("cx")){document.head.insertAdjacentHTML("beforeend",'<style id="cx">a[href="courses.html"]{display:none!important}</style>');}
if(!isPub)import("./courses-access.js").then(m=>m.check()).then(ok=>{if(ok.length){const x=document.getElementById("cx");if(x)x.remove()}}).catch(()=>{});
// Shared look + tidy header menu (theme.css) and a "Jump to" bar on long admin pages
if(!document.querySelector('link[href^="theme.css"]'))document.head.insertAdjacentHTML("beforeend",'<link rel="stylesheet" href="theme.css?v=1">');
if(!document.querySelector('meta[name=theme-color]'))document.head.insertAdjacentHTML("beforeend",'<meta name="theme-color" content="#12163a">');
(function(){
 const hd=document.querySelector("header.top"),nv=hd&&hd.querySelector("nav"),mb=hd&&hd.querySelector(".mb");if(!nv||!mb)return;
 const here=(location.pathname.split("/").pop()||"index.html");
 const head=document.createElement("div");head.className="nvh";head.textContent="Staff tools";nv.appendChild(head);
 let busy=false;
 const tidy=()=>{if(busy)return;busy=true;let st=0;
  nv.querySelectorAll(":scope>a").forEach(a=>{const h=(a.getAttribute("href")||"").split("?")[0];
   if(/(^|\/)(admin|teacher)\.html$|-admin\.html$/.test(h)){a.classList.add("stf");st++}
   a.classList.toggle("on",h===here||(here===""&&h==="index.html"))});
  head.classList.toggle("show",st>0);busy=false};
 new MutationObserver(tidy).observe(nv,{childList:true});tidy();
 const set=o=>{hd.classList.toggle("open",o);mb.setAttribute("aria-expanded",o?"true":"false");mb.innerHTML=o?"\u2715 Close":"\u2630 Menu"};
 mb.onclick=e=>{e.stopPropagation();set(!hd.classList.contains("open"))};
 document.addEventListener("click",e=>{if(hd.classList.contains("open")&&!hd.contains(e.target))set(false)});
 nv.addEventListener("click",e=>{if(e.target.closest("a"))set(false)});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")set(false)});
})();
(function(){
 let n=0;const iv=setInterval(()=>{n++;const m=document.querySelector("main.page");
  if(m&&!m.querySelector(".jb")){const cs=[...m.querySelectorAll(".cd")].filter(c=>c.querySelector(":scope>h2"));
   if(cs.length>=5){const bar=document.createElement("div");bar.className="jb";
    cs.forEach((c,i)=>{c.id=c.id||"sec"+i;const a=document.createElement("a");a.href="#"+c.id;a.textContent=c.querySelector(":scope>h2").textContent.trim();bar.appendChild(a)});
    const h1=m.querySelector("h1");(h1?h1.after(bar):m.prepend(bar));clearInterval(iv)}}
  if(n>40)clearInterval(iv)},250);
})();
import("./lang.js");
