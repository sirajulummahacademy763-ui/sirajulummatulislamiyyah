// Adds a "Pay in US dollars" box (Flutterwave) under the Buy coins section of wallet.html.
// It never adds coins itself. The server does that after Flutterwave confirms the payment.
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-config.js";

const FLW_PUBLIC_KEY = "FLWPUBK_TEST-7040a87feb475c96dd5f6049c0956ce7-X"; 
const COINS_PER_USD = 10;
const MIN_COINS = 10, MAX_COINS = 1000, STEP = 10;

let user = null;
onAuthStateChanged(auth, u => { user = u; place(); });

function loadFlutterwave() {
  return new Promise(res => {
    if (window.FlutterwaveCheckout) return res();
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.onload = res;
    document.head.appendChild(s);
  });
}

function boxHtml() {
  let opts = "";
  for (let c = MIN_COINS; c <= MAX_COINS; c += STEP) opts += `<option value="${c}">${c} coins</option>`;
  return `<h2>Paying from outside Nigeria?</h2>
    <p>Pay in US dollars with your card. 10 coins = $1. Coins are added automatically after payment.</p>
    <div class="chooser">
      <select id="flwCoins" aria-label="Number of coins">${opts}</select>
      <div class="price" id="flwPrice">$1</div>
    </div>
    <button type="button" id="flwPay" style="margin-top:14px;width:100%;padding:14px;border:0;border-radius:8px;background:#f5b94a;color:#12163a;font:700 1rem Figtree,sans-serif;cursor:pointer">Pay in US dollars</button>
    <p id="flwMsg" role="status" style="margin:14px 0 0;font-weight:500"></p>`;
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

  const sel = box.querySelector("#flwCoins"), price = box.querySelector("#flwPrice"), msg = box.querySelector("#flwMsg");
  const show = () => { price.textContent = "$" + (Number(sel.value) / COINS_PER_USD); };
  sel.onchange = show; show();

  box.querySelector("#flwPay").onclick = async () => {
    const usd = Number(sel.value) / COINS_PER_USD;
    msg.textContent = "Opening secure payment...";
    await loadFlutterwave();
    if (!window.FlutterwaveCheckout) { msg.textContent = "Payment system did not load. Check your internet and try again."; return; }
    window.FlutterwaveCheckout({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: "FLW-" + user.uid + "-" + Date.now(),
      amount: usd,
      currency: "USD",
      customer: { email: user.email, name: user.displayName || "Student" },
      customizations: { title: "Sirajul Ummah Islamic Institute", description: (usd * COINS_PER_USD) + " coins" },
      callback: () => { msg.textContent = "Payment received. Your " + (usd * COINS_PER_USD) + " coins will appear in a few seconds."; },
      onclose: () => { if (msg.textContent === "Opening secure payment...") msg.textContent = ""; }
    });
  };
}

// The wallet page draws itself after login, so keep watching until the Buy coins section exists
new MutationObserver(place).observe(document.documentElement, { childList: true, subtree: true });
