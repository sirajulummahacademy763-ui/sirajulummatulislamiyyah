// Adds a "Pay in your own currency" box (Flutterwave) under the Buy coins section of wallet.html.
// It never adds coins itself. The server does that after Flutterwave confirms the payment.
// Prices come from the flutterwave-coins Worker (/rates), so they are changed in one place only.
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-config.js";

const FLW_PUBLIC_KEY = "FLWPUBK-bb9274fc861002f2236b26b6ab2fbe4e-X"; // LIVE public key (safe to show). Never put the secret key here.
const RATES_URL = "https://flutterwave-coins.sirajulummahacademy763.workers.dev/rates";
const QUICK_PACKS = [10, 50, 100, 500];

let user = null, rates = null, ratesTried = false;
onAuthStateChanged(auth, u => { user = u; place(); });

async function getRates() {
  if (rates || ratesTried) return rates;
  ratesTried = true;
  try {
    const r = await fetch(RATES_URL, { cache: "no-store" });
    if (r.ok) rates = await r.json();
  } catch (e) {}
  return rates;
}

function loadFlutterwave() {
  return new Promise(res => {
    if (window.FlutterwaveCheckout) return res();
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.onload = res;
    s.onerror = res;
    document.head.appendChild(s);
  });
}

function fmt(c, amount) {
  const num = amount.toLocaleString("en-US", { minimumFractionDigits: c.dec, maximumFractionDigits: c.dec });
  return c.sym + " " + num;
}

function boxHtml() {
  const chips = QUICK_PACKS.map(c => `<button type="button" class="chip" data-c="${c}">${c}</button>`).join("");
  return `<span class="tag">International</span>
    <h2>Paying from outside Nigeria?</h2>
    <p>Pay in your own currency with your card or mobile money. Coins are added automatically after payment.</p>
    <div class="chooser" style="margin-bottom:10px">
      <select id="flwCur" aria-label="Your currency"><option>Loading...</option></select>
    </div>
    <div class="packs" id="flwPacks">${chips}</div>
    <div class="chooser">
      <select id="flwCoins" aria-label="Number of coins"></select>
      <div class="price" id="flwPrice"></div>
    </div>
    <button type="button" id="flwPay" disabled>Pay now</button>
    <p id="flwMsg" role="status" style="margin:14px 0 0;font-weight:500;color:#1f8a5b"></p>`;
}

function guessCurrency(list) {
  try {
    const lang = (navigator.language || "").toUpperCase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const map = { GH: "GHS", KE: "KES", UG: "UGX", TZ: "TZS", RW: "RWF", ZA: "ZAR", ZM: "ZMW", GB: "GBP", CA: "CAD", EG: "EGP", SA: "SAR", AE: "AED", QA: "QAR" };
    const region = (lang.split("-")[1] || "");
    if (map[region] && list[map[region]]) return map[region];
    const tzMap = { "Africa/Accra": "GHS", "Africa/Nairobi": "KES", "Africa/Kampala": "UGX", "Africa/Dar_es_Salaam": "TZS", "Africa/Kigali": "RWF", "Africa/Johannesburg": "ZAR", "Africa/Lusaka": "ZMW", "Europe/London": "GBP", "Africa/Cairo": "EGP", "Asia/Riyadh": "SAR", "Asia/Dubai": "AED", "Asia/Qatar": "QAR" };
    if (tzMap[tz] && list[tzMap[tz]]) return tzMap[tz];
  } catch (e) {}
  return "USD";
}

function place() {
  if (!user || document.getElementById("flwBox")) return;
  const anchor = document.querySelector(".buy");
  if (!anchor) return;
  const box = document.createElement("section");
  box.className = "buy";
  box.id = "flwBox";
  box.innerHTML = boxHtml();
  anchor.insertAdjacentElement("afterend", box);

  const cur = box.querySelector("#flwCur"), sel = box.querySelector("#flwCoins");
  const price = box.querySelector("#flwPrice"), msg = box.querySelector("#flwMsg"), pay = box.querySelector("#flwPay");
  const chips = box.querySelectorAll("#flwPacks .chip");

  const show = () => {
    const c = rates && rates.currencies[cur.value];
    if (!c) return;
    price.textContent = fmt(c, c.prices[sel.value]);
    chips.forEach(ch => ch.classList.toggle("on", ch.dataset.c === sel.value));
  };
  const fillCoins = () => {
    const keep = sel.value;
    sel.innerHTML = "";
    for (let n = rates.min; n <= rates.max; n += rates.step) {
      const o = document.createElement("option");
      o.value = n; o.textContent = n + " coins";
      sel.appendChild(o);
    }
    sel.value = rates.currencies[cur.value].prices[keep] ? keep : String(rates.min);
    show();
  };

  getRates().then(r => {
    if (!r) { msg.style.color = "#b3261e"; msg.textContent = "Could not load prices. Refresh the page and try again."; cur.innerHTML = "<option>Unavailable</option>"; return; }
    cur.innerHTML = Object.keys(r.currencies).map(k => `<option value="${k}">${k} · ${r.currencies[k].name}</option>`).join("");
    cur.value = guessCurrency(r.currencies);
    fillCoins();
    pay.disabled = false;
  });

  cur.onchange = fillCoins;
  sel.onchange = show;
  chips.forEach(ch => ch.onclick = () => { if (rates) { sel.value = ch.dataset.c; show(); } });

  pay.onclick = async () => {
    if (!rates) return;
    const code = cur.value, coins = Number(sel.value);
    const amount = rates.currencies[code].prices[sel.value];
    msg.style.color = "#1f8a5b";
    msg.textContent = "Opening secure payment...";
    await loadFlutterwave();
    if (!window.FlutterwaveCheckout) { msg.style.color = "#b3261e"; msg.textContent = "Payment system did not load. Check your internet and try again."; return; }
    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: "FLW-" + user.uid + "-" + Date.now(),
      amount: amount,
      currency: code,
      customer: { email: user.email, name: user.displayName || "Student" },
      customizations: { title: "Sirajul Ummah Islamic Institute", description: coins + " coins" },
      callback: () => { msg.textContent = "Payment received. Your " + coins + " coins will appear in a few seconds. Refresh the page if you do not see them."; },
      onclose: () => { if (msg.textContent === "Opening secure payment...") msg.textContent = ""; }
    });
  };
}

// The wallet page draws itself after login, so keep watching until the Buy coins section exists
new MutationObserver(place).observe(document.documentElement, { childList: true, subtree: true });
