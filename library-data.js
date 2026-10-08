// EDIT THIS FILE to add reciters, hadith audio, classes and free books.

export const BOOK_PRICE = 2; // coins to unlock each class book

// Qur'an reciters. Each file must be named 001.mp3 ... 114.mp3 inside "base".
// gender: "male" or "female". Test every link after adding it.
export const RECITERS = [
  { name: "Mishary Alafasy", gender: "male", base: "https://server8.mp3quran.net/afs/" },
  { name: "Abdur-Rahman As-Sudais", gender: "male", base: "https://server11.mp3quran.net/sds/" },
  // { name: "Reciter name", gender: "female", base: "https://example.com/folder/" },
];

// Hadith audio. Add { title: "...", url: "https://.../file.mp3" }
export const HADITH_AUDIO = {
  arabic: [],
  english: [],
};

// Free general PDF books (open to everyone, no coins).
// Add { title: "...", url: "https://.../book.pdf" }
export const FREE_BOOKS = [];

// Paid class books: one PDF per class.
export const DEPTS = {
  arabic: "Arabic and Islamic books",
  western: "Western studies",
  tech: "Technology",
};

const LEVELS = {
  arabic: [
    "Rawdatul Atfal",
    "Ibtidai 1", "Ibtidai 2", "Ibtidai 3", "Ibtidai 4", "Ibtidai 5", "Ibtidai 6",
    "I'dadi 1", "I'dadi 2", "I'dadi 3",
    "Thanawi 1", "Thanawi 2", "Thanawi 3",
  ],
  western: [
    "KG",
    "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
    "JSS 1", "JSS 2", "JSS 3",
    "SS 1", "SS 2", "SS 3",
  ],
  tech: [
    "Computer Basics", "Digital Safety", "Web Design", "JavaScript", "Python", "Spreadsheets",
  ],
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Each book id is also its PDF file name in Firebase Storage: books/<id>.pdf
export const BOOKS = Object.entries(LEVELS).flatMap(([dept, list]) =>
  list.map((level) => ({ dept, level, id: `${dept}-${slug(level)}` }))
);
