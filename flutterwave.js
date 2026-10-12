// Flutterwave webhook: credits coins after a verified US dollar payment.
// 10 coins = $1. Coins are only ever added here, on the server.
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const FLW_SECRET_KEY = defineSecret('FLW_SECRET_KEY');   // from Flutterwave > Settings > API
const FLW_SECRET_HASH = defineSecret('FLW_SECRET_HASH'); // the secret hash you type in Flutterwave > Settings > Webhooks
const COINS_PER_USD = 10;

exports.flutterwaveWebhook = onRequest({ secrets: [FLW_SECRET_KEY, FLW_SECRET_HASH] }, async (req, res) => {
  // 1. Only accept requests that carry your secret hash
  if (req.headers['verif-hash'] !== FLW_SECRET_HASH.value()) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body || {};
  const txId = event.data && event.data.id;
  if (!txId) return res.sendStatus(200);

  try {
    // 2. Never trust the webhook body: ask Flutterwave to confirm the payment
    const r = await fetch(
      'https://api.flutterwave.com/v3/transactions/' + encodeURIComponent(txId) + '/verify',
      { headers: { Authorization: 'Bearer ' + FLW_SECRET_KEY.value() } }
    );
    const j = await r.json();
    const d = j && j.data;
    if (!r.ok || j.status !== 'success' || !d || d.status !== 'successful' || d.currency !== 'USD') {
      return res.sendStatus(200);
    }

    // 3. The student's id is inside the transaction reference: FLW-<uid>-<time>
    const parts = String(d.tx_ref || '').split('-');
    if (parts.length < 3 || parts[0] !== 'FLW') return res.sendStatus(200);
    const uid = parts[1];
    const coins = Math.floor(Number(d.amount) * COINS_PER_USD);
    if (!uid || !(coins > 0)) return res.sendStatus(200);

    // 4. Credit once only (Flutterwave can send the same webhook twice)
    await db.runTransaction(async (t) => {
      const purchaseRef = db.doc('purchases/flw_' + d.id);
      const studentRef = db.doc('students/' + uid);
      if ((await t.get(purchaseRef)).exists) return;
      t.set(purchaseRef, {
        uid, coins, amount: Number(d.amount), currency: 'USD', provider: 'flutterwave',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      t.set(studentRef, { coins: admin.firestore.FieldValue.increment(coins) }, { merge: true });
    });
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500); // Flutterwave will try again
  }
});
