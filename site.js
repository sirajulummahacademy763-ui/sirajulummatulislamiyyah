(function(){try{var T={day:["#072f25","#0a4535","#0d6a50","#052219","#0a3f31"],mid:["#0a3f31","#0f5a44","#12805f","#08342a","#0a3f31"],night:["#1a7f60","#25997a","#31b08c","#146a50","#1a7f60"]};var cur="";function set(k){if(k===cur)return;cur=k;var v=T[k],r=document.documentElement.style;r.setProperty("--night",v[0]);r.setProperty("--deep",v[1]);r.setProperty("--brand",v[2]);r.setProperty("--night2",v[3]);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",v[4])}
function byClock(){var h=new Date().getHours();return(h>=8&&h<=16)?"day":((h>=5&&h<8)||(h>=17&&h<=19))?"mid":"night"}
set(byClock());setInterval(function(){if(!window.__smLux)set(byClock())},600000);
if("AmbientLightSensor"in window){try{var s=new AmbientLightSensor({frequency:0.2});s.onreading=function(){window.__smLux=1;var l=s.illuminance;set(l>=300?"day":l<=20?"night":"mid")};s.start()}catch(e){}}}catch(e){}})();
// Security: never let another website show this site inside a frame (clickjacking)
try{if(window.top!==window.self){window.top.location=window.self.location}}catch(e){document.documentElement.style.display="none"}
// Pages anyone can open without logging in (written without ".html", because Netlify can show /about instead of /about.html)
const PUBLIC=["about","contact","privacy","terms","donate","parent","study-plan","faculty","vision","knowledge"];
const page=(location.pathname.split("/").pop()||"index").replace(/\.html$/,"");
const isPub=PUBLIC.includes(page);
const isHome=!!window.SITE_HOME;
if(isPub)document.documentElement.classList.add("ok");else if(!isHome)import("./guard.js").catch(()=>location.replace("login.html"));
const nav=(isPub||isHome)?[["index.html","Home"],["about.html","About"],["vision.html","Vision & Mission"],["study-plan.html","Study Plan"],["faculty.html","Faculty"],["knowledge.html","Knowledge Series"],["contact.html","Contact"],["donate.html","Donate"],["login.html","Log in"]]:[["index.html","Home"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
const cta=(isPub||isHome)?'<a class="btn" href="register.html">Join free</a>':'<a class="btn" href="#" data-logout>Log out</a>';
if(!document.querySelector('link[rel=icon]'))document.head.insertAdjacentHTML("beforeend",'<link rel="icon" href="logo.svg">');
document.body.insertAdjacentHTML("afterbegin",
 '<header class="top"><a class="logo" href="index.html" style="display:flex;align-items:center;gap:10px"><img src="logo.svg" alt="" width="40" height="40"><span style="display:block;line-height:1.25"><span dir="rtl" lang="ar" style="display:block;font-family:Amiri,serif;font-size:1.15em">معهد سراج الأمة الإسلامية</span>Sirajul Ummah Islamic Institute</span></a><button class="mb" type="button" aria-expanded="false" aria-controls="mainnav">\u2630 Menu</button><nav id="mainnav">'+
 nav.map(n=>'<a href="'+n[0]+'">'+n[1]+'</a>').join("")+
 cta+'</nav></header>');
{
 document.head.insertAdjacentHTML("beforeend",'<style id="zfcss">.zf{background:var(--night,#072f25);color:#cfe3d8;padding:40px clamp(18px,5vw,64px) 24px;border-top:4px solid #f0be4d}.zf .zg{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:28px;max-width:1100px;margin:0 auto}.zf h4{margin:0 0 10px;color:#f1c75c;font-size:1rem}.zf a{display:block;color:#cfe3d8;text-decoration:none;padding:5px 0}.zf a:hover{color:#f1c75c}.zf .zb{font-family:Amiri,serif;font-size:1.25rem;color:#f1c75c;display:block;margin-bottom:6px}.zf .zs{display:flex;flex-direction:column;gap:8px;margin-top:14px;max-width:340px}.zf .zs a{display:flex;align-items:center;gap:14px;min-height:52px;padding:6px 16px 6px 8px;border:1.5px solid rgba(240,190,77,.45);border-radius:999px;font-weight:700;color:#fff;background:rgba(255,255,255,.04)}.zf .zs a i{flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center}.zf .zs a svg{width:20px;height:20px;fill:#fff}.zf .zs a:hover{background:rgba(240,190,77,.18);border-color:#f0be4d;color:#fff}@media(max-width:760px){.zf .zg{grid-template-columns:1fr 1fr}.zf .zg>div:first-child{grid-column:1/-1}}</style>');
 const zm=document.getElementById("zfmount");(zm?(h=>zm.insertAdjacentHTML("beforebegin",h)):(h=>document.body.insertAdjacentHTML("beforeend",h)))(
 '<footer class="zf"><div class="zg"><div><span dir="rtl" lang="ar" class="zb">معهد سراج الأمة الإسلامية لتحفيظ القرآن ودراسة العلوم العربية والإسلامية والغربية والتقنية عبر الإنترنت</span><b>Sirajul Ummah Islamic Institute</b><br>For Qur\u2019an Memorization, Arabic, Islamic and Western Studies, and Technology through Online Learning.<div class="zs" id="zsoc"></div></div>'+
 '<div><h4>About us</h4><a href="about.html">About the Institute</a><a href="vision.html">Vision &amp; Mission</a><a href="contact.html">Contact</a><a href="donate.html">Donate</a></div>'+
 '<div><h4>Study</h4><a href="study-plan.html">Study Plan</a><a href="faculty.html">Faculty Members</a><a href="knowledge.html">Knowledge Series</a><a href="library.html">Library</a></div>'+
 '<div><h4>Your account</h4><a href="register.html">Register</a><a href="login.html">Log in</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></div></div></footer>');
 // Social links the admin saved on the Website content page
 Promise.all([import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),import("./firebase-config.js")]).then(([f,c])=>f.getDoc(f.doc(c.db,"publicInfo","site"))).then(d=>{
  if(!d.exists())return;const x=d.data(),box=document.getElementById("zsoc");if(!box)return;
  const IC={
   facebook:["#1877F2","M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"],
   youtube:["#FF0000","M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"],
   whatsapp:["#25D366","M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"],
   instagram:["linear-gradient(45deg,#F9A000,#E4405F 50%,#8A3AB9)","M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"],
   x:["#000000","M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"],
   telegram:["#26A5E4","M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"],
   tiktok:["#010101","M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"]};
  [["facebook","Facebook"],["youtube","YouTube"],["whatsapp","WhatsApp"],["instagram","Instagram"],["x","X (Twitter)"],["telegram","Telegram"],["tiktok","TikTok"]].forEach(p=>{
   const u=String(x[p[0]]||"");if(!/^https:\/\//i.test(u))return;
   const a=document.createElement("a");a.href=u;a.target="_blank";a.rel="noopener";a.setAttribute("aria-label",p[1]);
   const ic=IC[p[0]];a.innerHTML='<i style="background:'+ic[0]+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+ic[1]+'"/></svg></i><span>'+p[1]+'</span>';box.appendChild(a)});
 }).catch(()=>{});
}
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
      b.style.cssText="position:sticky;top:0;z-index:9990;display:block;background:#f0be4d;color:var(--night);font:700 14px Figtree,system-ui,sans-serif;text-align:center;padding:10px 12px;text-decoration:none";
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
  const STU=[["index.html","Home"],["subjects.html","Subjects"],["timetable.html","Timetable"],["classroom.html","Classroom"],["homework.html","Homework"],["exams.html","Exams"],["certificate.html","Certificates"],["report-card.html","Report Card"],["revision.html","Hifz & Revision"],["library.html","Library"],["wallet.html","My wallet"],["study-plan.html","Study Plan"],["faculty.html","Faculty"],["knowledge.html","Knowledge Series"],["vision.html","Vision & Mission"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
  const TCH=[["index.html","Home"],["teacher.html","Teacher"],["my-classes.html","My Classes"],["issue-reports.html","Issue Reports"],["absent-admin.html","Absent students"],["supervisor-inbox.html","Messages"],["signatures.html","My Signature"],["classroom.html","Classroom"],["timetable.html","Timetable"],["subjects.html","Subjects"],["library.html","Library"],["study-plan.html","Study Plan"],["faculty.html","Faculty"],["knowledge.html","Knowledge Series"],["vision.html","Vision & Mission"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
  const ADM=[["index.html?home=1","Home"],["dashboard.html","Today (admin)"],["admin.html","Admin"],["revision-admin.html","Hifz & Revision (admin)"],["classes-admin.html","Classes & Timetable (admin)"],["classroom.html","Classroom"],["teacher-assign-admin.html","Assign Teachers (admin)"],["overview-admin.html","Overview (admin)"],["signatures.html","Signature & Stamp (admin)"],["supervisors-admin.html","Supervisors (admin)"],["principals-admin.html","Principals (admin)"],["messages-admin.html","Messages (admin)"],["homework-admin.html","Homework & Reports (admin)"],["countries-admin.html","Students & Teachers by Country (admin)"],["students-admin.html","Students (admin)"],["absent-admin.html","Absent students"],["backup-admin.html","Backup (admin)"],["revision-choices-admin.html","Hifz & Revision choices (admin)"],["content-admin.html","Website content (admin)"],["timetable.html","Timetable"],["subjects.html","Subjects"],["library.html","Library"],["study-plan.html","Study Plan"],["faculty.html","Faculty"],["knowledge.html","Knowledge Series"],["vision.html","Vision & Mission"],["about.html","About"],["contact.html","Contact"],["donate.html","Donate"]];
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
   "about.html":["The institute","about us"],"study-plan.html":["The institute","study plan curriculum levels subjects schedule"],"faculty.html":["The institute","faculty teachers staff"],"knowledge.html":["The institute","knowledge series articles lessons blog"],"vision.html":["The institute","vision mission values testimonials"],"content-admin.html":["Admin settings","website content teachers stories articles social links vision"],"contact.html":["The institute","contact phone whatsapp email"]};
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
      if(isHome){
        const nv0=document.querySelector("header.top nav");
        if(nv0&&!nv0.querySelector("[data-logout]")){const lo0=document.createElement("a");lo0.className="btn";lo0.href="#";lo0.setAttribute("data-logout","");lo0.textContent="Log out";nv0.appendChild(lo0);
          lo0.onclick=async e=>{e.preventDefault();try{await a.signOut(c.auth)}catch(x){}location.href="login.html"}}
        import("./guard.js").catch(()=>{});
        import("./classes-check.js").catch(()=>{});
        import("./notice-popup.js?v=9").catch(()=>{});
        import("./courses-access.js").then(m=>m.check()).then(ok=>{if(ok.length){const x=document.getElementById("cx");if(x)x.remove()}}).catch(()=>{});
        const bs0=document.createElement("script");bs0.src="bot.js?v=6";document.body.appendChild(bs0);
      }
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
  }).catch(()=>{ if(!isHome)show(STU); });
}
// Copyright line on every page
if(!window.SITE_HOME)document.body.insertAdjacentHTML("beforeend",
 '<div style="background:var(--night,var(--night));color:#bfd6ca;text-align:center;padding:14px 16px;font-size:.85rem;border-top:1px solid rgba(255,255,255,.12)">&copy; '+new Date().getFullYear()+' Sirajul Ummah Islamic Institute. All rights reserved.<br>Website developed with Alpha Tech Hub</div>');
// Help bot
if(!isPub&&!window.SITE_HOME){const bs=document.createElement("script");bs.src="bot.js?v=6";document.body.appendChild(bs);}
if(!isPub&&!isHome)import("./classes-check.js");
if(!isPub&&!isHome)import("./notice-popup.js?v=9").catch(()=>{});
// Courses link: hidden unless the student is in Thanawi 3, SSS 3 or Advanced Technology
if(!document.getElementById("cx")){document.head.insertAdjacentHTML("beforeend",'<style id="cx">a[href="courses.html"]{display:none!important}</style>');}
if(!isPub&&!isHome)import("./courses-access.js").then(m=>m.check()).then(ok=>{if(ok.length){const x=document.getElementById("cx");if(x)x.remove()}}).catch(()=>{});
// Shared look + tidy header menu (theme.css) and a "Jump to" bar on long admin pages
if(!document.querySelector('link[href^="theme.css"]'))document.head.insertAdjacentHTML("beforeend",'<link rel="stylesheet" href="theme.css?v=7">');
if(!document.querySelector('meta[name=theme-color]'))document.head.insertAdjacentHTML("beforeend",'<meta name="theme-color" content="#0a3f31">');
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
 const GN={"index.html":"Start","dashboard.html":"Start","subjects.html":"Classes & learning","timetable.html":"Classes & learning","classroom.html":"Classes & learning","quran-classroom.html":"Classes & learning","homework.html":"Classes & learning","exams.html":"Classes & learning","revision.html":"Classes & learning","library.html":"Classes & learning","courses.html":"Classes & learning","teacher.html":"Teaching","my-classes.html":"Teaching","report-card.html":"Results & reports","certificate.html":"Results & reports","issue-reports.html":"Results & reports","homework-admin.html":"Results & reports","overview-admin.html":"Results & reports","signatures.html":"Results & reports","messages-admin.html":"People & messages","supervisor-inbox.html":"People & messages","supervisor.html":"People & messages","supervisors-admin.html":"People & messages","principals-admin.html":"People & messages","principal.html":"People & messages","teacher-assign-admin.html":"People & messages","countries-admin.html":"People & messages","admin.html":"Admin settings","backup-admin.html":"Admin settings","students-admin.html":"People & messages","absent-admin.html":"Results & reports","classes-admin.html":"Admin settings","revision-admin.html":"Admin settings","revision-choices-admin.html":"Admin settings","wallet.html":"Wallet & giving","donate.html":"Wallet & giving","about.html":"The institute","contact.html":"The institute","study-plan.html":"The institute","faculty.html":"The institute","knowledge.html":"The institute","vision.html":"The institute","content-admin.html":"Admin settings"};
 const DESC={"admin.html":"Manage students, teachers, terms, notices and the library. Tap a section to open it, or use the round buttons to jump straight to one.","countries-admin.html":"Everyone who registered, grouped by country. Use the search box to find a person.","revision-admin.html":"Set the teacher for each juz, for boys and girls separately.","classroom.html":"Your class room: lectures, voice notes, quizzes and questions for your teacher."};
 const group=GN[here]||"";
 const ttl=h=>{const c=h.cloneNode(true);c.querySelectorAll("small").forEach(x=>x.remove());const p=c.textContent.split("\u00b7").map(x=>x.trim()).filter(Boolean);return (p.find(x=>/[A-Za-z]/.test(x))||p[0]||"").replace(/[<>&]/g,"")};
 let done=false,tries=0;
 const place=()=>{
  const m=document.querySelector("main.page");if(!m)return false;
  if(m.querySelector("#cert"))return true;   // the printed certificate keeps its own design: no breadcrumb inside it
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
 const d=document.createElement("div");d.style.cssText="text-align:center;font:11px Figtree,system-ui,sans-serif;color:#8fb0a0;background:var(--night);padding:0 8px 10px";
 const jb=document.querySelector(".jb"),fold=document.querySelectorAll(".cd.fold").length,crumb=!!document.querySelector(".crumb");
 d.textContent="site v18 · layer: "+(window.__layer||"not run")+" · crumb: "+(crumb?"yes":"no")+" · folding: "+fold+" · page: "+(location.pathname.split("/").pop()||"/");
 document.body.appendChild(d);
}catch(e){}},4000);
import("./lang.js");

// Safety net: any leftover navy/blue panel (for example a banner drawn by a file we did not recolour) is turned into the site green.
(function(){try{
var busy=0;
function navy(c){var m=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c||"");if(!m)return false;var r=+m[1],g=+m[2],b=+m[3];return b>g+12&&b>r+12&&Math.max(r,g,b)<150}
function fix(){busy=0;var els=document.querySelectorAll("div,section,aside,a,article,li,button,span,p");
for(var i=0;i<els.length&&i<4000;i++){var e=els[i];if(e.closest("#sb-root"))continue;var cs=getComputedStyle(e);
 if(navy(cs.backgroundColor)){e.style.setProperty("background-color","var(--night)","important");if(cs.backgroundImage&&cs.backgroundImage!=="none")e.style.setProperty("background-image","none","important")}
 else if(cs.backgroundImage&&cs.backgroundImage.indexOf("gradient")>-1){var m=/rgba?\(\d+,\s*\d+,\s*\d+/.exec(cs.backgroundImage);if(m&&navy(m[0])){e.style.setProperty("background-image","linear-gradient(135deg,var(--night),var(--deep))","important")}}}}
function later(){if(!busy){busy=1;setTimeout(fix,500)}}
window.addEventListener("load",function(){later();setTimeout(fix,2500);setTimeout(fix,6000);new MutationObserver(later).observe(document.body,{childList:true,subtree:true})});
}catch(e){}})();

;(function(){try{if(/exam/i.test(location.pathname)&&!window.__examGuard){var g=document.createElement("script");g.src="exam-guard.js?v=1";document.head.appendChild(g)}}catch(e){}})();

;(function(){try{if(window.SITE_HOME&&!window.__portalLoaded){window.__portalLoaded=1;var p=document.createElement("script");p.type="module";p.src="portal.js?v=2";document.head.appendChild(p)}}catch(e){}})();
