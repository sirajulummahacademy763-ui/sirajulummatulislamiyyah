const PUBLIC=["privacy.html","terms.html"];
const page=location.pathname.split("/").pop()||"index.html";
const isPub=PUBLIC.includes(page);
if(isPub)document.documentElement.classList.add("ok");else import("./guard.js").catch(()=>location.replace("login.html"));
const nav=isPub?[["login.html","Log in"]]:[["index.html","Home"],["courses.html","Courses"],["library.html","Library"],["about.html","About"],["contact.html","Contact"],["wallet.html","My wallet"]];
const cta=isPub?'<a class="btn" href="register.html">Join free</a>':'<a class="btn" href="#" data-logout>Log out</a>';
if(!document.querySelector('link[rel=icon]'))document.head.insertAdjacentHTML("beforeend",'<link rel="icon" href="logo.svg">');
document.body.insertAdjacentHTML("afterbegin",
 '<header class="top"><a class="logo" href="index.html" style="display:flex;align-items:center;gap:10px"><img src="logo.svg" alt="" width="40" height="40"><span style="display:block;line-height:1.25"><span dir="rtl" lang="ar" style="display:block;font-family:Amiri,serif;font-size:1.15em">معهد سراج الأمة الإسلامية</span>Sirajul Ummah Islamic Institute</span></a><nav>'+
 nav.map(n=>'<a href="'+n[0]+'">'+n[1]+'</a>').join("")+
 cta+'</nav></header>');
document.body.insertAdjacentHTML("beforeend",
 '<footer><div style="max-width:560px"><span dir="rtl" lang="ar" style="display:block;font-family:Amiri,serif;font-size:1.2rem;color:#f5b94a">معهد سراج الأمة الإسلامية لتحفيظ القرآن ودراسة العلوم العربية والإسلامية والغربية والتقنية عبر الإنترنت</span><b>Sirajul Ummah Islamic Institute</b><br>For Qur\u2019an Memorization, Arabic, Islamic and Western Studies, and Technology through Online Learning.</div>'+
 '<div><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="contact.html">Contact</a></div></footer>');
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
      try{ if((await f.getDoc(f.doc(c.db,"admins",u.uid))).exists())add("admin.html","Admin"); }catch(e){}
      try{ if((await f.getDoc(f.doc(c.db,"teachers",u.uid))).exists())add("teacher.html","Teacher"); }catch(e){}
    });
  }).catch(()=>{});
}
