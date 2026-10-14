// Female reciters for the Qur'an reader in library.html.
// This file ADDS to window.EXTRA_RECITERS, so it never replaces reciters-extra.js.
// surahs: the surah numbers she has recorded. Any other surah will NOT play (a message is shown instead).
// url: {n} becomes the surah number with 3 digits (001 ... 114).
window.EXTRA_RECITERS = (window.EXTRA_RECITERS || []).concat([
  { id: "rogayah-sulong", name: "Rogayah Sulong (Malaysia)", gender: "female", surahs: [36],
    url: "https://cdn.mp3quran.net/audio/rogayah-sulong/r1/{n}.mp3" },
  { id: "sapinah-mamat", name: "Sapinah Mamat (Malaysia)", gender: "female", surahs: [3, 14, 21, 22],
    url: "https://cdn.mp3quran.net/audio/sapinah-mamat/r1/{n}.mp3" },
  { id: "rodziah-abdulrahman", name: "Rodziah Abdulrahman (Malaysia)", gender: "female", surahs: [3, 8, 33, 35],
    url: "https://cdn.mp3quran.net/audio/rodziah-abdulrahman/r1/{n}.mp3" }
]);
