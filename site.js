// Pages anyone can open without logging in (written without ".html", because Netlify can show /about instead of /about.html)
const PUBLIC=["about","contact","privacy","terms","donate","parent"];
const page=(location.pathname.split("/").pop()||"index").replace(/\.html$/,"");
const isPub=PUBLIC.includes(page);
if(isPub)document.documentElement.classList.add("ok");else import("./guard.js").catch(()=>location.replace("login.html"));
const nav=isPub?[["index.html","Home"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"],["login.html","Log in"]]:[["index.html","Home"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
const cta=isPub?'<a class="btn" href="register.html">Join free</a>':'<a class="btn" href="#" data-logout>Log out</a>';
if(!document.querySelector('link[rel=icon]'))document.head.insertAdjacentHTML("beforeend",'<link rel="icon" href="logo.svg">');
document.body.insertAdjacentHTML("afterbegin",
 '<header class="top"><a class="logo" href="index.html" style="display:flex;align-items:center;gap:10px"><img src="logo.svg" alt="" width="40" height="40"><span style="display:block;line-height:1.25"><span dir="rtl" lang="ar" style="display:block;font-family:Amiri,serif;font-size:1.15em">معهد سراج الأمة الإسلامية</span>Sirajul Ummah Islamic Institute</span></a><button class="mb" type="button" aria-expanded="false" aria-controls="mainnav">\u2630 Menu</button><nav id="mainnav">'+
 nav.map(n=>'<a href="'+n[0]+'">'+n[1]+'</a>').join("")+
 cta+'</nav></header>');
if(!window.SITE_HOME)document.body.insertAdjacentHTML("beforeend",
 '<footer><div style="max-width:560px"><span dir="rtl" lang="ar" style="display:block;font-family:Amiri,serif;font-size:1.2rem;color:#f5b94a">معهد سراج الأمة الإسلامية لتحفيظ القرآن ودراسة العلوم العربية والإسلامية والغربية والتقنية عبر الإنترنت</span><b>Sirajul Ummah Islamic Institute</b><br>For Qur\u2019an Memorization, Arabic, Islamic and Western Studies, and Technology through Online Learning.</div>'+
 '<div><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="contact.html">Contact</a><a href="donate.html">Donate</a></div></footer>');
const cat=new URLSearchParams(location.search).get("category");
document.querySelectorAll("[data-cat]").forEach(el=>{if(cat&&el.dataset.cat!==cat)el.hidden=true});
document.querySelectorAll(".tabs a").forEach(a=>{if((a.dataset.t||"")===(cat||""))a.classList.add("on")});
// Use "Institute" everywhere
document.title=document.title.replace(/Sirajul Ummah Academy/g,"Sirajul Ummah Islamic Institute");
(function(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){n.nodeValue=n.nodeValue.replace(/\bthe academy\b/g,"the institute").replace(/\bacademy services\b/g,"institute services").replace(/\bAcademy\b/g,"Institute")}})();
// Menu by role: admin sees admin pages, a teacher sees teacher pages only, a student sees student pages only

// New-message strip at the top of every page for the director, supervisors and teachers
async function notify(role,u,isSup,f,c){
  try{
    const here=location.pathname.split("/").pop();
    if(here==="supervisor-inbox.html"||here==="messages-admin.html")return;
    const db=c.db;let seen=0;try{seen=+localStorage.getItem("msgSeen_"+u.uid)||0}catch(e){}
    const ck="msgCnt_"+u.uid;let n=-1;
    try{const x=JSON.parse(sessionStorage.getItem(ck)||"null");if(x&&Date.now()-x.t<60000&&x.seen===seen)n=x.n}catch(e){}
    if(n<0){
      n=0;
      const col=x=>f.collection(db,x),W=f.where,Q=f.query;
      const cnt=async(q,from,self)=>{try{(await f.getDocs(q)).forEach(s=>{const d=s.data();const tm=d.createdAt&&d.createdAt.seconds?d.createdAt.seconds*1000:Date.now();if(d.from===from&&tm>seen&&!(self&&d.supUid===u.uid))n++})}catch(e){}};
      if(role==="admin"){await cnt(col("adminMsgs"),"user")}
      else{
        await cnt(Q(col("adminMsgs"),W("threadUid","==",u.uid)),"admin");
        let ks=[];try{const a=await f.getDoc(f.doc(db,"teacherAssign",u.uid));ks=a.exists()?(a.data().classKeys||[]):[]}catch(e){}
        for(const k of ks.slice(0,20))await cnt(Q(col("supervisorMsgs"),W("classKey","==",k)),"supervisor",true);
        if(isSup)await cnt(Q(col("supervisorMsgs"),W("supUid","==",u.uid)),"teacher");
      }
      try{sessionStorage.setItem(ck,JSON.stringify({t:Date.now(),seen,n}))}catch(e){}
    }
    if(n>0&&!document.getElementById("msgbar")){
      const b=document.createElement("a");b.id="msgbar";b.href=role==="admin"?"messages-admin.html":"supervisor-inbox.html";
      b.textContent="💬 You have "+n+" new message"+(n>1?"s":"")+" · tap to read";
      b.style.cssText="position:sticky;top:0;z-index:9990;display:block;background:#f5b94a;color:#12163a;font:700 14px Figtree,system-ui,sans-serif;text-align:center;padding:10px 12px;text-decoration:none";
      document.body.insertBefore(b,document.body.firstChild);
    }
  }catch(e){}
}

// "New lecture posted" strip for students and teachers (lectures of their own classes, newer than the last visit to Recorded Lectures)
async function notifyLec(role,u,f,c){
  try{
    const here=location.pathname.split("/").pop();
    if(here==="lectures.html"||here.indexOf("login")===0)return;
    const sk="lecSeen_"+u.uid;let seen=0;try{seen=+localStorage.getItem(sk)||0}catch(e){}
    if(!seen){try{localStorage.setItem(sk,String(Date.now()))}catch(e){}return}
    const ck="lecCnt_"+u.uid;let n=-1;
    try{const x=JSON.parse(sessionStorage.getItem(ck)||"null");if(x&&Date.now()-x.t<60000&&x.seen===seen)n=x.n}catch(e){}
    if(n<0){
      n=0;const db=c.db;let ks=[];
      if(role==="student"){const s=await f.getDoc(f.doc(db,"students",u.uid));const cl=s.exists()?(s.data().classes||{}):{};ks=Object.keys(cl).filter(k=>cl[k]&&cl[k]!=="none").map(k=>k+"|"+cl[k])}
      else{const a=await f.getDoc(f.doc(db,"teacherAssign",u.uid));ks=a.exists()?(a.data().classKeys||[]):[]}
      for(const k of ks.slice(0,20)){try{(await f.getDocs(f.query(f.collection(db,"lectures"),f.where("classKey","==",k)))).docs.forEach(d=>{const x=d.data();const tm=x.createdAt&&x.createdAt.seconds?x.createdAt.seconds*1000:0;if(tm>seen&&x.ready!==false&&x.teacherId!==u.uid)n++})}catch(e){}}
      try{sessionStorage.setItem(ck,JSON.stringify({t:Date.now(),seen,n}))}catch(e){}
    }
    if(n>0&&!document.getElementById("lecbar")){
      const m=document.getElementById("msgbar");
      const b=document.createElement("a");b.id="lecbar";b.href="lectures.html";
      b.textContent="🎧 "+n+" new lecture"+(n>1?"s":"")+" posted · tap to listen";
      b.style.cssText="position:sticky;top:"+(m?m.offsetHeight:0)+"px;z-index:9989;display:block;background:#1c7a4d;color:#fff;font:700 14px Figtree,system-ui,sans-serif;text-align:center;padding:10px 12px;text-decoration:none";
      document.body.insertBefore(b,m?m.nextSibling:document.body.firstChild);
    }
  }catch(e){}
}
if(!isPub){
  const STU=[["index.html","Home"],["subjects.html","Subjects"],["timetable.html","Timetable"],["classroom.html","Classroom"],["lectures.html","Recorded Lectures"],["homework.html","Homework"],["exams.html","Exams"],["certificate.html","Certificates"],["report-card.html","Report Card"],["revision.html","Hifz & Revision"],["library.html","Library"],["wallet.html","My wallet"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
  const TCH=[["index.html","Home"],["teacher.html","Teacher"],["my-classes.html","My Classes"],["issue-reports.html","Issue Reports"],["supervisor-inbox.html","Messages"],["signatures.html","My Signature"],["classroom.html","Classroom"],["lectures.html","Recorded Lectures"],["timetable.html","Timetable"],["subjects.html","Subjects"],["library.html","Library"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
  const ADM=[["index.html?home=1","Home"],["dashboard.html","Today (admin)"],["admin.html","Admin"],["revision-admin.html","Hifz & Revision (admin)"],["classes-admin.html","Classes & Timetable (admin)"],["teacher-assign-admin.html","Assign Teachers (admin)"],["overview-admin.html","Overview (admin)"],["signatures.html","Signature & Stamp (admin)"],["supervisors-admin.html","Supervisors (admin)"],["lectures.html","Recorded Lectures"],["messages-admin.html","Messages (admin)"],["homework-admin.html","Homework & Reports (admin)"],["countries-admin.html","Students & Teachers by Country (admin)"],["revision-choices-admin.html","Hifz & Revision choices (admin)"],["timetable.html","Timetable"],["subjects.html","Subjects"],["library.html","Library"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
  const show=list=>{
    const nv=document.querySelector("header.top nav");if(!nv)return;
    nv.querySelectorAll(":scope>a:not([data-logout])").forEach(a=>a.remove());
    const lo=nv.querySelector("[data-logout]");
    list.forEach(n=>{const a=document.createElement("a");a.href=n[0];a.textContent=n[1];nv.insertBefore(a,lo)});
  };
  window.SITE_ROLE_MENU={STU,TCH,ADM,show};
  Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
    import("./firebase-config.js")
  ]).then(([a,f,c])=>{
    a.onAuthStateChanged(c.auth,async u=>{
      if(!u)return;
      let role="student";
      try{ if((await f.getDoc(f.doc(c.db,"admins",u.uid))).exists())role="admin"; }catch(e){}
      if(role==="student"){try{ if((await f.getDoc(f.doc(c.db,"teachers",u.uid))).exists())role="teacher"; }catch(e){}}
      document.documentElement.setAttribute("data-role",role);
      // A student's class membership record (lets that class's teachers see who is in the class)
      if(role==="student"){try{
        const k="cm_"+u.uid+"_v1";
        if(!sessionStorage.getItem(k)){
          const sd=await f.getDoc(f.doc(c.db,"students",u.uid));
          if(sd.exists()){const d=sd.data(),cl=d.classes||{};
            for(const sec of Object.keys(cl)){const lv=cl[sec];if(!lv||lv==="none")continue;
              await f.setDoc(f.doc(c.db,"classMembers",u.uid+"__"+sec),{uid:u.uid,name:d.name||u.email||"Student",classKey:sec+"|"+lv,section:sec,level:lv,updatedAt:f.serverTimestamp()});}
            sessionStorage.setItem(k,"1");}
        }
      }catch(e){}}
      if(role==="admin"){const p=location.pathname.split("/").pop();if((p===""||p==="index.html")&&!/[?&]home=1/.test(location.search)){location.replace("dashboard.html");return;}}
      let tl=TCH,isSup=false;
      if(role==="teacher"){try{ if((await f.getDoc(f.doc(c.db,"supervisors",u.uid))).exists()){isSup=true;tl=TCH.slice(0,3).concat([["supervisor.html","Supervisor"]],TCH.slice(3));} }catch(e){}}
      show(role==="admin"?ADM:role==="teacher"?tl:STU);
      if(role!=="student")notify(role,u,isSup,f,c);
      if(role!=="admin")setTimeout(()=>notifyLec(role,u,f,c),400);
    });
  }).catch(()=>{ show(STU); });
}
// Copyright line on every page
if(!window.SITE_HOME)document.body.insertAdjacentHTML("beforeend",
 '<div style="background:var(--night,#12163b);color:#c9ccdf;text-align:center;padding:14px 16px;font-size:.85rem;border-top:1px solid rgba(255,255,255,.12)">&copy; '+new Date().getFullYear()+' Sirajul Ummah Islamic Institute. All rights reserved.<br>Website developed with Alpha Tech Hub</div>');
// Help bot
if(!isPub&&!window.SITE_HOME){const bs=document.createElement("script");bs.src="bot.js";document.body.appendChild(bs);}
if(!isPub)import("./classes-check.js");
if(!isPub)import("./notice-popup.js?v=7").catch(()=>{});
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
