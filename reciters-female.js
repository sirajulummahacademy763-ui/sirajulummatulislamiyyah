// Female reciters for the Qur'an reader in library.html.
// This file ADDS to window.EXTRA_RECITERS, so it never replaces reciters-extra.js.
// url: {n} becomes the surah number with 3 digits (001 ... 114).
window.EXTRA_RECITERS = (window.EXTRA_RECITERS || []).concat([
  { id: "noreen-siddiq", name: "Noreen Mohammad Siddiq (Pakistan) · Riwayat ad-Duri", gender: "female",
    url: "https://cdn.mp3quran.net/audio/noreen-siddiq/r1/{n}.mp3" }
]);
