const nav=[["index.html","Home"],["courses.html","Courses"],["library.html","Library"],["about.html","About"],["contact.html","Contact"],["login.html","Log in"]];
document.body.insertAdjacentHTML("afterbegin",
 '<header class="top"><a class="logo" href="index.html">Sirajul Ummah Al-Islamiyyah Academy</a><nav>'+
 nav.map(n=>'<a href="'+n[0]+'">'+n[1]+'</a>').join("")+
 '<a class="btn" href="register.html">Join free</a></nav></header>');
document.body.insertAdjacentHTML("beforeend",
 '<footer><div><b>Sirajul Ummah Al-Islamiyyah Academy</b><br>Seeking beneficial knowledge, one step at a time.</div>'+
 '<div><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="contact.html">Contact</a></div></footer>');
// Category filter for courses and library pages: ?category=quran
const cat=new URLSearchParams(location.search).get("category");
document.querySelectorAll("[data-cat]").forEach(el=>{if(cat&&el.dataset.cat!==cat)el.hidden=true});
document.querySelectorAll(".tabs a").forEach(a=>{if((a.dataset.t||"")===(cat||""))a.classList.add("on")});
