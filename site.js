// Security: never let another website show this site inside a frame (clickjacking)
try{if(window.top!==window.self){window.top.location=window.self.location}}catch(e){document.documentElement.style.display="none"}
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
async function notify(role,u,isSup,f,c,isPrin){
  try{
    const here=location.pathname.split("/").pop();
    if(here==="supervisor-inbox.html"||here==="messages-admin.html"||here==="principal.html")return;
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
        // staff chain: principal questions to a teacher's class, supervisor questions to a principal, and replies back up
        for(const k of ks.slice(0,20))await cnt(Q(col("orgMsgs"),W("kind","==","prinClass"),W("classKey","==",k)),"principal");
        if(isPrin){
          await cnt(Q(col("orgMsgs"),W("kind","==","supPrin"),W("prUid","==",u.uid)),"supervisor");
          await cnt(Q(col("orgMsgs"),W("kind","==","prinClass"),W("prUid","==",u.uid)),"teacher");
        }
        if(isSup)await cnt(Q(col("orgMsgs"),W("kind","==","supPrin"),W("supUid","==",u.uid)),"principal");
      }
      try{sessionStorage.setItem(ck,JSON.stringify({t:Date.now(),seen,n}))}catch(e){}
    }
    if(n>0&&!document.getElementById("msgbar")){
      const b=document.createElement("a");b.id="msgbar";b.href=role==="admin"?"messages-admin.html":(isPrin?"principal.html":"supervisor-inbox.html");
      b.textContent="💬 You have "+n+" new message"+(n>1?"s":"")+" · tap to read";
      b.style.cssText="position:sticky;top:0;z-index:9990;display:block;background:#f5b94a;color:#12163a;font:700 14px Figtree,system-ui,sans-serif;text-align:center;padding:10px 12px;text-decoration:none";
      document.body.insertBefore(b,document.body.firstChild);
    }
  }catch(e){}
}

// "New lecture posted" strip for students and teachers (lectures posted in their classrooms since they last opened that classroom's Lectures)
async function notifyLec(role,u,f,c){
  try{
    const here=location.pathname.split("/").pop();
    if(here.indexOf("login")===0)return;
    const sk="lecSeen_"+u.uid;let seen={};try{seen=JSON.parse(localStorage.getItem(sk)||"{}")||{}}catch(e){}
    const ck="lecCnt_"+u.uid;let res=null;
    try{const x=JSON.parse(sessionStorage.getItem(ck)||"null");if(x&&Date.now()-x.t<60000)res=x}catch(e){}
    if(!res){
      const db=c.db,slug=t=>String(t).replace(/[^A-Za-z0-9]+/g,"-");let rooms=[];
      if(role==="student"){
        const s=await f.getDoc(f.doc(db,"students",u.uid));const sd=s.exists()?s.data():{},cl=sd.classes||{};
        Object.keys(cl).forEach(k=>{if(cl[k]&&cl[k]!=="none")rooms.push([k+"__"+slug(cl[k]),"classroom.html"])});
        try{const ch=await f.getDoc(f.doc(db,"revisionChoices",u.uid));const g=String(sd.gender||"").toLowerCase();
          if(ch.exists()&&g){const x=ch.data();(x.track==="both"?["hifz","revision"]:[x.track]).forEach(t=>rooms.push([t+"__Juz-"+x.juz+"-"+g,"quran-classroom.html"]))}}catch(e){}
      }else{
        const a=await f.getDoc(f.doc(db,"teacherAssign",u.uid));
        (a.exists()?(a.data().classKeys||[]):[]).forEach(k=>{const p=k.split("|");rooms.push([p[0]+"__"+slug(p.slice(1).join("|")),"classroom.html"])});
      }
      let n=0,href="",dirty=false;
      for(const [rid,page] of rooms.slice(0,12)){
        if(!seen[rid]){seen[rid]=Date.now();dirty=true;continue}
        try{(await f.getDocs(f.query(f.collection(db,"classrooms",rid,"lectures"),f.orderBy("createdAt","desc"),f.limit(5)))).docs.forEach(d=>{const x=d.data();const tm=x.createdAt&&x.createdAt.seconds?x.createdAt.seconds*1000:0;if(tm>seen[rid]&&x.status==="done"&&x.by!==u.uid){n++;if(!href)href=page+"?id="+encodeURIComponent(rid)}})}catch(e){}
      }
      if(dirty){try{localStorage.setItem(sk,JSON.stringify(seen))}catch(e){}}
      res={t:Date.now(),n,href};try{sessionStorage.setItem(ck,JSON.stringify(res))}catch(e){}
    }
    if(res.n>0&&!document.getElementById("lecbar")){
      const m=document.getElementById("msgbar");
      const b=document.createElement("a");b.id="lecbar";b.href=res.href||"classroom.html";
      b.textContent="🎧 "+res.n+" new lecture"+(res.n>1?"s":"")+" posted · tap to open the class";
      b.style.cssText="position:sticky;top:"+(m?m.offsetHeight:0)+"px;z-index:9989;display:block;background:#1c7a4d;color:#fff;font:700 14px Figtree,system-ui,sans-serif;text-align:center;padding:10px 12px;text-decoration:none";
      document.body.insertBefore(b,m?m.nextSibling:document.body.firstChild);
    }
  }catch(e){}
}
if(!isPub){
  const STU=[["index.html","Home"],["subjects.html","Subjects"],["timetable.html","Timetable"],["classroom.html","Classroom"],["homework.html","Homework"],["exams.html","Exams"],["certificate.html","Certificates"],["report-card.html","Report Card"],["revision.html","Hifz & Revision"],["library.html","Library"],["wallet.html","My wallet"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
  const TCH=[["index.html","Home"],["teacher.html","Teacher"],["my-classes.html","My Classes"],["issue-reports.html","Issue Reports"],["absent-admin.html","Absent students"],["supervisor-inbox.html","Messages"],["signatures.html","My Signature"],["classroom.html","Classroom"],["timetable.html","Timetable"],["subjects.html","Subjects"],["library.html","Library"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
  const ADM=[["index.html?home=1","Home"],["dashboard.html","Today (admin)"],["admin.html","Admin"],["revision-admin.html","Hifz & Revision (admin)"],["classes-admin.html","Classes & Timetable (admin)"],["classroom.html","Classroom"],["teacher-assign-admin.html","Assign Teachers (admin)"],["overview-admin.html","Overview (admin)"],["signatures.html","Signature & Stamp (admin)"],["supervisors-admin.html","Supervisors (admin)"],["principals-admin.html","Principals (admin)"],["messages-admin.html","Messages (admin)"],["homework-admin.html","Homework & Reports (admin)"],["countries-admin.html","Students & Teachers by Country (admin)"],["students-admin.html","Students (admin)"],["absent-admin.html","Absent students"],["backup-admin.html","Backup (admin)"],["revision-choices-admin.html","Hifz & Revision choices (admin)"],["timetable.html","Timetable"],["subjects.html","Subjects"],["library.html","Library"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
  // ---- Menu: grouped by purpose, with a search box and an A-Z switch ----
  const GROUPS=["Start","Classes & learning","Teaching","Results & reports","People & messages","Admin settings","Wallet & giving","The institute"];
  const ICON={"Start":"🏠","Classes & learning":"📚","Teaching":"🧑‍🏫","Results & reports":"📝","People & messages":"👥","Admin settings":"⚙️","Wallet & giving":"💰","The institute":"ℹ️"};
  const MAP={"index.html":["Start","home main"],"dashboard.html":["Start","today tasks money coins payments dashboard"],
   "subjects.html":["Classes & learning","lessons courses books"],"timetable.html":["Classes & learning","schedule time table days"],"classroom.html":["Classes & learning","live class lecture lectures recorded video youtube voice"],
   "quran-classroom.html":["Classes & learning","quran hifz revision live call lecture lectures recorded"],"homework.html":["Classes & learning","assignment answer voice photo"],"exams.html":["Classes & learning","test quiz exam"],
   "revision.html":["Classes & learning","hifz revision quran juz memorize"],"library.html":["Classes & learning","books pdf read"],
   "teacher.html":["Teaching","teacher courses lessons"],"my-classes.html":["Teaching","students homework marks classes attendance"],
   "report-card.html":["Results & reports","result grade term marks"],"certificate.html":["Results & reports","certificates award"],"issue-reports.html":["Results & reports","report cards issue term"],
   "homework-admin.html":["Results & reports","homework reports overview marks"],"overview-admin.html":["Results & reports","overview classes students"],"signatures.html":["Results & reports","signature stamp sign"],
   "messages-admin.html":["People & messages","messages inbox chat supervisors teachers"],"supervisor-inbox.html":["People & messages","messages inbox director questions"],"supervisor.html":["People & messages","supervisor approve reports"],
   "supervisors-admin.html":["People & messages","supervisors"],"principals-admin.html":["People & messages","principals head teacher"],"principal.html":["People & messages","principal head teacher classes questions attendance"],"teacher-assign-admin.html":["People & messages","assign teachers classes subjects"],"countries-admin.html":["People & messages","students teachers country list"],
   "students-admin.html":["People & messages","students delete remove account search"],"absent-admin.html":["Results & reports","absent attendance missed classes remind whatsapp"],"backup-admin.html":["Admin settings","backup save download data export"],"admin.html":["Admin settings","students teachers codes terms notices library coins"],"classes-admin.html":["Admin settings","classes timetable time zone"],"revision-admin.html":["Admin settings","hifz revision juz teachers"],"revision-choices-admin.html":["Admin settings","hifz revision choices students"],
   "wallet.html":["Wallet & giving","coins buy money balance"],"donate.html":["Wallet & giving","sadaqah charity give donation"],
   "about.html":["The institute","about us"],"contact.html":["The institute","contact phone whatsapp email"]};
  const grp=h=>{const k=String(h).split("?")[0].split("/").pop();return MAP[k]||["The institute",""]};
  let AZ=false;try{AZ=localStorage.getItem("menuAZ")==="1"}catch(e){}
  const show=list=>{
    const nv=document.querySelector("header.top nav");if(!nv)return;
    nv.classList.add("grp");
    nv.querySelectorAll(":scope>a:not([data-logout]),:scope>.gh,:scope>.nvs,:scope>.nvn").forEach(a=>a.remove());
    const lo=nv.querySelector("[data-logout]");
    const bar=document.createElement("div");bar.className="nvs";
    bar.innerHTML='<input type="search" class="nvq" placeholder="🔍 Search the menu..." aria-label="Search the menu" autocomplete="off"><button type="button" class="nvz" title="Sort A to Z">A–Z</button>';
    nv.insertBefore(bar,lo);
    const q=bar.querySelector("input"),zb=bar.querySelector("button");
    const empty=document.createElement("div");empty.className="nvn";empty.textContent="Nothing found. Try another word.";empty.hidden=true;
    const draw=()=>{
      nv.querySelectorAll(":scope>a:not([data-logout]),:scope>.gh,:scope>.nvn").forEach(a=>a.remove());
      zb.classList.toggle("on",AZ);
      const items=list.map(n=>({h:n[0],t:n[1],g:grp(n[0])}));
      const mk=n=>{const a=document.createElement("a");a.href=n.h;a.textContent=n.t;a.dataset.k=(n.t+" "+n.g[1]+" "+n.g[0]).toLowerCase();return a};
      if(AZ){items.slice().sort((x,y)=>x.t.localeCompare(y.t)).forEach(n=>nv.insertBefore(mk(n),lo))}
      else GROUPS.forEach(g=>{const its=items.filter(n=>n.g[0]===g);if(!its.length)return;
        const h=document.createElement("div");h.className="gh";h.textContent=ICON[g]+" "+g;h.dataset.g=g;nv.insertBefore(h,lo);
        its.forEach(n=>{const a=mk(n);a.dataset.g=g;nv.insertBefore(a,lo)})});
      nv.insertBefore(empty,lo);filter();
    };
    const filter=()=>{
      const t=q.value.trim().toLowerCase();let any=false;const seen={};
      nv.querySelectorAll(":scope>a:not([data-logout])").forEach(a=>{const ok=!t||t.split(/\s+/).every(w=>a.dataset.k.indexOf(w)>-1);a.hidden=!ok;if(ok){any=true;seen[a.dataset.g]=1}});
      nv.querySelectorAll(":scope>.gh").forEach(h=>{h.hidden=!seen[h.dataset.g]});
      empty.hidden=any;
    };
    q.oninput=filter;
    q.onkeydown=e=>{if(e.key==="Enter"){const a=[...nv.querySelectorAll(":scope>a:not([data-logout])")].find(x=>!x.hidden);if(a)location.href=a.href}};
    zb.onclick=e=>{e.stopPropagation();AZ=!AZ;try{localStorage.setItem("menuAZ",AZ?"1":"0")}catch(x){}draw()};
    draw();
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
      // Security: staff (admin/teacher) are signed out after 30 minutes without activity
      if(role!=="student"){try{
        let last=Date.now();
        const bump=()=>{last=Date.now()};
        ["click","keydown","touchstart","scroll","mousemove"].forEach(ev=>addEventListener(ev,bump,{passive:true}));
        setInterval(async()=>{ if(Date.now()-last>30*60*1000){ try{await a.signOut(c.auth)}catch(e){} location.href="login.html"; } },30000);
      }catch(e){}}
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
      let tl=TCH,isSup=false,isPrin=false;
      if(role==="teacher"){
        try{ if((await f.getDoc(f.doc(c.db,"supervisors",u.uid))).exists()){isSup=true;tl=tl.slice(0,3).concat([["supervisor.html","Supervisor"]],tl.slice(3));} }catch(e){}
        try{ if((await f.getDoc(f.doc(c.db,"principals",u.uid))).exists()){isPrin=true;tl=tl.slice(0,3).concat([["principal.html","Principal"]],tl.slice(3));} }catch(e){}
      }
      // The Quran Classroom (Hifz and Revision) appears only for those students, their teachers and the admin
      let qc=false;const qk="qc_"+u.uid;
      try{const x=JSON.parse(sessionStorage.getItem(qk)||"null");if(x&&Date.now()-x.t<600000)qc=x.v;else{
        if(role==="admin")qc=true;
        else if(role==="student")qc=(await f.getDoc(f.doc(c.db,"revisionChoices",u.uid))).exists();
        else{const qs=await f.getDocs(f.query(f.collection(c.db,"classrooms"),f.where("teacherId","==",u.uid),f.where("section","in",["hifz","revision"]),f.limit(1)));qc=qs.docs.length>0}
        sessionStorage.setItem(qk,JSON.stringify({t:Date.now(),v:qc}));}}catch(e){}
      const withQ=l=>qc?l.reduce((a,x)=>{a.push(x);if(x[0]==="classroom.html")a.push(["quran-classroom.html","Quran Classroom"]);return a},[]):l;
      show(withQ(role==="admin"?ADM:role==="teacher"?tl:STU));
      if(role!=="student")notify(role,u,isSup,f,c,isPrin);
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
if(!document.querySelector('link[href^="theme.css"]'))document.head.insertAdjacentHTML("beforeend",'<link rel="stylesheet" href="theme.css?v=4">');
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
    const h1=m.querySelector("h1");(h1?h1.after(bar):m.prepend(bar));clearInterval(iv);
    // On the Admin page the long sections fold: only the titles show, tap one to open it
    if((location.pathname.split("/").pop()||"")==="admin.html"){
     const setO=(c,o)=>{c.classList.toggle("shut",!o);const t=c.querySelector(":scope>h2");if(t)t.setAttribute("aria-expanded",o?"true":"false")};
     cs.forEach(c=>{c.classList.add("fold");const t=c.querySelector(":scope>h2");t.tabIndex=0;t.setAttribute("role","button");
      const tg=()=>setO(c,c.classList.contains("shut"));t.onclick=tg;t.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tg()}};setO(c,false)});
     bar.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{const c=document.getElementById(a.getAttribute("href").slice(1));if(c)setO(c,true)}));
     const all=document.createElement("a");all.href="#";all.textContent="Open all";all.dataset.all="0";
     all.onclick=e=>{e.preventDefault();const o=all.dataset.all==="0";cs.forEach(c=>setO(c,o));all.dataset.all=o?"1":"0";all.textContent=o?"Close all":"Open all"};bar.appendChild(all);
     if(location.hash){const c=document.getElementById(location.hash.slice(1));if(c&&c.classList.contains("fold"))setO(c,true)}
    }}}
  if(n>40)clearInterval(iv)},250);
})();
// ---- Page structure layer: breadcrumb, short intro, "find on this page" box, back-to-top button ----
(function(){try{
 if(typeof isPub!=="undefined"&&isPub)return;
 const here=(location.pathname.split("/").pop()||"index.html");
 if(here==="index.html"||here==="login.html"||here==="register.html"||here==="dashboard.html")return;
 const GN={"index.html":"Start","dashboard.html":"Start","subjects.html":"Classes & learning","timetable.html":"Classes & learning","classroom.html":"Classes & learning","quran-classroom.html":"Classes & learning","homework.html":"Classes & learning","exams.html":"Classes & learning","revision.html":"Classes & learning","library.html":"Classes & learning","courses.html":"Classes & learning","teacher.html":"Teaching","my-classes.html":"Teaching","report-card.html":"Results & reports","certificate.html":"Results & reports","issue-reports.html":"Results & reports","homework-admin.html":"Results & reports","overview-admin.html":"Results & reports","signatures.html":"Results & reports","messages-admin.html":"People & messages","supervisor-inbox.html":"People & messages","supervisor.html":"People & messages","supervisors-admin.html":"People & messages","principals-admin.html":"People & messages","principal.html":"People & messages","teacher-assign-admin.html":"People & messages","countries-admin.html":"People & messages","admin.html":"Admin settings","backup-admin.html":"Admin settings","students-admin.html":"People & messages","absent-admin.html":"Results & reports","classes-admin.html":"Admin settings","revision-admin.html":"Admin settings","revision-choices-admin.html":"Admin settings","wallet.html":"Wallet & giving","donate.html":"Wallet & giving","about.html":"The institute","contact.html":"The institute"};
 const DESC={"admin.html":"Manage students, teachers, terms, notices and the library. Tap a section to open it, or use the round buttons to jump straight to one.","countries-admin.html":"Everyone who registered, grouped by country. Use the search box to find a person.","revision-admin.html":"Set the teacher for each juz, for boys and girls separately.","classroom.html":"Your class room: lectures, voice notes, quizzes and questions for your teacher."};
 const group=GN[here]||"";
 const ttl=h=>{const c=h.cloneNode(true);c.querySelectorAll("small").forEach(x=>x.remove());const p=c.textContent.split("\u00b7").map(x=>x.trim()).filter(Boolean);return (p.find(x=>/[A-Za-z]/.test(x))||p[0]||"").replace(/[<>&]/g,"")};
 let done=false,tries=0;
 const place=()=>{
  const m=document.querySelector("main.page");if(!m)return false;
  const h1=m.querySelector("h1");if(!h1)return false;
  if(!m.querySelector(".crumb")){
   const c=document.createElement("nav");c.className="crumb";c.setAttribute("aria-label","Where you are");
   c.innerHTML='<a href="'+(document.documentElement.getAttribute("data-role")==="admin"?"dashboard.html":"index.html")+'">Home</a>'+(group&&group!=="Start"?' <span>›</span> <b>'+group+"</b>":"")+' <span>›</span> <b>'+ttl(h1)+"</b>";
   h1.after(c);
   const nx=c.nextElementSibling;
   if(DESC[here]&&!(nx&&/^(P|DIV)$/.test(nx.tagName)&&/lead|hint|pgin/.test(nx.className))&&!m.querySelector(".lead,p.hint")){
    const p=document.createElement("p");p.className="pgin";p.textContent=DESC[here];c.after(p)}
  }
  return true};
 const ITEMS=".it,.item,.lc,details,main.page tbody tr";
 const findItems=m=>[...m.querySelectorAll(ITEMS)].filter(x=>!x.closest("#chat,#panel,.pgs,.jb,header,nav,#quiz"));
 const filter=()=>{
  const m=document.querySelector("main.page"),i=m&&m.querySelector(".pgq");if(!i)return;
  const t=i.value.trim().toLowerCase(),words=t.split(/\s+/).filter(Boolean);let shown=0,all=0;
  findItems(m).forEach(x=>{all++;const ok=!words.length||words.every(w=>x.textContent.toLowerCase().indexOf(w)>-1);x.classList.toggle("pgx",!ok);if(ok)shown++});
  const c=m.querySelector(".pgc");if(c)c.textContent=words.length?(shown+" of "+all+" shown"):"";
 };
 const addSearch=()=>{
  const m=document.querySelector("main.page");if(!m||m.querySelector(".pgs"))return;
  if(m.querySelector("#chat")||/^(report-card|parent|wallet|donate|signatures|classroom|quran-classroom)\.html$/.test(here))return;
  if(m.querySelector('input[type=search],input[placeholder*="earch"],input[placeholder*="Find"]'))return;
  if(findItems(m).length<8)return;
  const anchor=m.querySelector(".pgin")||m.querySelector(".crumb");if(!anchor)return;
  const w=document.createElement("div");w.className="pgs";
  w.innerHTML='<input type="search" class="pgq" placeholder="🔍 Find on this page (a name, a class, a word)..." aria-label="Find on this page" autocomplete="off"><span class="pgc" aria-live="polite"></span>';
  anchor.after(w);w.querySelector("input").oninput=filter;
  new MutationObserver(()=>{clearTimeout(window.__pgt);window.__pgt=setTimeout(filter,200)}).observe(m,{childList:true,subtree:true});
 };
 const iv=setInterval(()=>{tries++;const ok=place();if(ok)addSearch();if(tries>50)clearInterval(iv)},300);
 const tt=document.createElement("button");tt.type="button";tt.className="totop";tt.setAttribute("aria-label","Back to top");tt.textContent="↑";tt.hidden=true;
 tt.onclick=()=>window.scrollTo({top:0,behavior:"smooth"});document.body.appendChild(tt);
 window.addEventListener("scroll",()=>{tt.hidden=window.scrollY<700},{passive:true});
 window.__layer="ran";
}catch(e){window.__layer="failed: "+(e&&e.message)}})();
// Admin-only line at the bottom of each page: which site.js is running (helps find caching problems)
setTimeout(()=>{try{
 if(document.documentElement.getAttribute("data-role")!=="admin")return;
 const d=document.createElement("div");d.style.cssText="text-align:center;font:11px Figtree,system-ui,sans-serif;color:#9aa0c8;background:#12163a;padding:0 8px 10px";
 const jb=document.querySelector(".jb"),fold=document.querySelectorAll(".cd.fold").length,crumb=!!document.querySelector(".crumb");
 d.textContent="site v18 · layer: "+(window.__layer||"not run")+" · crumb: "+(crumb?"yes":"no")+" · folding: "+fold+" · page: "+(location.pathname.split("/").pop()||"/");
 document.body.appendChild(d);
}catch(e){}},4000);
import("./lang.js");
