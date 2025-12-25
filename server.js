const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DATA_DIR = path.join(__dirname, 'data');
const STATE_PATH = path.join(DATA_DIR, 'state.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const booksData = [
  { id: 'gen', name: 'Genesis', testament: 'Old', totalChapters: 50 },
  { id: 'exo', name: 'Exodus', testament: 'Old', totalChapters: 40 },
  { id: 'lev', name: 'Leviticus', testament: 'Old', totalChapters: 27 },
  { id: 'num', name: 'Numbers', testament: 'Old', totalChapters: 36 },
  { id: 'deu', name: 'Deuteronomy', testament: 'Old', totalChapters: 34 },
  { id: 'jos', name: 'Joshua', testament: 'Old', totalChapters: 24 },
  { id: 'jdg', name: 'Judges', testament: 'Old', totalChapters: 21 },
  { id: 'rut', name: 'Ruth', testament: 'Old', totalChapters: 4 },
  { id: '1sa', name: '1 Samuel', testament: 'Old', totalChapters: 31 },
  { id: '2sa', name: '2 Samuel', testament: 'Old', totalChapters: 24 },
  { id: '1ki', name: '1 Kings', testament: 'Old', totalChapters: 22 },
  { id: '2ki', name: '2 Kings', testament: 'Old', totalChapters: 25 },
  { id: '1ch', name: '1 Chronicles', testament: 'Old', totalChapters: 29 },
  { id: '2ch', name: '2 Chronicles', testament: 'Old', totalChapters: 36 },
  { id: 'ezr', name: 'Ezra', testament: 'Old', totalChapters: 10 },
  { id: 'neh', name: 'Nehemiah', testament: 'Old', totalChapters: 13 },
  { id: 'est', name: 'Esther', testament: 'Old', totalChapters: 10 },
  { id: 'job', name: 'Job', testament: 'Old', totalChapters: 42 },
  { id: 'psa', name: 'Psalms', testament: 'Old', totalChapters: 150 },
  { id: 'pro', name: 'Proverbs', testament: 'Old', totalChapters: 31 },
  { id: 'ecc', name: 'Ecclesiastes', testament: 'Old', totalChapters: 12 },
  { id: 'sng', name: 'Song of Solomon', testament: 'Old', totalChapters: 8 },
  { id: 'isa', name: 'Isaiah', testament: 'Old', totalChapters: 66 },
  { id: 'jer', name: 'Jeremiah', testament: 'Old', totalChapters: 52 },
  { id: 'lam', name: 'Lamentations', testament: 'Old', totalChapters: 5 },
  { id: 'ezk', name: 'Ezekiel', testament: 'Old', totalChapters: 48 },
  { id: 'dan', name: 'Daniel', testament: 'Old', totalChapters: 12 },
  { id: 'hos', name: 'Hosea', testament: 'Old', totalChapters: 14 },
  { id: 'jol', name: 'Joel', testament: 'Old', totalChapters: 3 },
  { id: 'amo', name: 'Amos', testament: 'Old', totalChapters: 9 },
  { id: 'oba', name: 'Obadiah', testament: 'Old', totalChapters: 1 },
  { id: 'jon', name: 'Jonah', testament: 'Old', totalChapters: 4 },
  { id: 'mic', name: 'Micah', testament: 'Old', totalChapters: 7 },
  { id: 'nah', name: 'Nahum', testament: 'Old', totalChapters: 3 },
  { id: 'hab', name: 'Habakkuk', testament: 'Old', totalChapters: 3 },
  { id: 'zep', name: 'Zephaniah', testament: 'Old', totalChapters: 3 },
  { id: 'hag', name: 'Haggai', testament: 'Old', totalChapters: 2 },
  { id: 'zec', name: 'Zechariah', testament: 'Old', totalChapters: 14 },
  { id: 'mal', name: 'Malachi', testament: 'Old', totalChapters: 4 },
  { id: 'mat', name: 'Matthew', testament: 'New', totalChapters: 28 },
  { id: 'mrk', name: 'Mark', testament: 'New', totalChapters: 16 },
  { id: 'luk', name: 'Luke', testament: 'New', totalChapters: 24 },
  { id: 'jhn', name: 'John', testament: 'New', totalChapters: 21 },
  { id: 'act', name: 'Acts', testament: 'New', totalChapters: 28 },
  { id: 'rom', name: 'Romans', testament: 'New', totalChapters: 16 },
  { id: '1co', name: '1 Corinthians', testament: 'New', totalChapters: 16 },
  { id: '2co', name: '2 Corinthians', testament: 'New', totalChapters: 13 },
  { id: 'gal', name: 'Galatians', testament: 'New', totalChapters: 6 },
  { id: 'eph', name: 'Ephesians', testament: 'New', totalChapters: 6 },
  { id: 'php', name: 'Philippians', testament: 'New', totalChapters: 4 },
  { id: 'col', name: 'Colossians', testament: 'New', totalChapters: 4 },
  { id: '1th', name: '1 Thessalonians', testament: 'New', totalChapters: 5 },
  { id: '2th', name: '2 Thessalonians', testament: 'New', totalChapters: 3 },
  { id: '1ti', name: '1 Timothy', testament: 'New', totalChapters: 6 },
  { id: '2ti', name: '2 Timothy', testament: 'New', totalChapters: 4 },
  { id: 'tit', name: 'Titus', testament: 'New', totalChapters: 3 },
  { id: 'phm', name: 'Philemon', testament: 'New', totalChapters: 1 },
  { id: 'heb', name: 'Hebrews', testament: 'New', totalChapters: 13 },
  { id: 'jas', name: 'James', testament: 'New', totalChapters: 5 },
  { id: '1pe', name: '1 Peter', testament: 'New', totalChapters: 5 },
  { id: '2pe', name: '2 Peter', testament: 'New', totalChapters: 3 },
  { id: '1jn', name: '1 John', testament: 'New', totalChapters: 5 },
  { id: '2jn', name: '2 John', testament: 'New', totalChapters: 1 },
  { id: '3jn', name: '3 John', testament: 'New', totalChapters: 1 },
  { id: 'jud', name: 'Jude', testament: 'New', totalChapters: 1 },
  { id: 'rev', name: 'Revelation', testament: 'New', totalChapters: 22 }
];

// Prepare state on startup so the first request has data ready.
ensureState();

function ensureState() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STATE_PATH)) {
    const chapters = {};
    booksData.forEach((book) => {
      for (let i = 1; i <= book.totalChapters; i += 1) {
        const id = `${book.id}-${i}`;
        chapters[id] = {
          id,
          bookId: book.id,
          chapterNumber: i,
          isRead: false,
          readAt: null
        };
      }
    });

    const initialState = {
      books: booksData,
      chapters,
      user_settings: {
        displayedStats: [
          'overallProgress',
          'dailyAverage',
          'estimatedCompletion',
          'readingStreak',
          'booksCompleted',
          'testamentProgress'
        ],
        theme: 'light',
        dailyGoal: 1,
        viewPreference: 'expanded'
      },
      reading_history: []
    };

    fs.writeFileSync(STATE_PATH, JSON.stringify(initialState, null, 2));
  }
}

function loadState() {
  ensureState();
  const raw = fs.readFileSync(STATE_PATH, 'utf8');
  return JSON.parse(raw);
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function sendJson(res, status, data) {
  const json = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json)
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

function computeStats(state) {
  const { books, chapters, reading_history, user_settings } = state;
  const chapterList = Object.values(chapters);
  const total = chapterList.length;
  const read = chapterList.filter((c) => c.isRead).length;
  const overallProgress = total === 0 ? 0 : Math.round((read / total) * 10000) / 100;

  let dailyAverage = 0;
  let estimatedCompletion = null;
  let readingStreak = 0;
  let firstReadDate = null;
  const daysWithReads = new Set();

  if (reading_history.length > 0) {
    const sortedHistory = [...reading_history].sort((a, b) => new Date(a.readAt) - new Date(b.readAt));
    firstReadDate = new Date(sortedHistory[0].readAt);
    const now = new Date();
    const diffDays = Math.max(1, Math.ceil((now - firstReadDate) / (1000 * 60 * 60 * 24)));
    dailyAverage = +(read / diffDays).toFixed(2);

    sortedHistory.forEach((item) => {
      daysWithReads.add(formatDate(item.readAt));
    });

    let cursor = formatDate(new Date());
    while (daysWithReads.has(cursor)) {
      readingStreak += 1;
      const curDate = new Date(cursor);
      curDate.setDate(curDate.getDate() - 1);
      cursor = formatDate(curDate);
    }

    if (dailyAverage > 0) {
      const remaining = total - read;
      const daysRemaining = Math.ceil(remaining / dailyAverage);
      if (daysRemaining < 14) {
        estimatedCompletion = `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
      } else if (daysRemaining < 60) {
        estimatedCompletion = `${Math.round(daysRemaining / 7)} week(s)`;
      } else {
        estimatedCompletion = `${Math.round(daysRemaining / 30)} month(s)`;
      }
    }
  }

  const booksCompleted = books.filter((book) => {
    const readCount = chapterList.filter((c) => c.bookId === book.id && c.isRead).length;
    return readCount === book.totalChapters;
  }).length;

  const oldTestamentChapters = chapterList.filter((c) => books.find((b) => b.id === c.bookId && b.testament === 'Old'));
  const newTestamentChapters = chapterList.filter((c) => books.find((b) => b.id === c.bookId && b.testament === 'New'));

  const oldRead = oldTestamentChapters.filter((c) => c.isRead).length;
  const newRead = newTestamentChapters.filter((c) => c.isRead).length;

  const testamentProgress = {
    old: oldTestamentChapters.length === 0 ? 0 : Math.round((oldRead / oldTestamentChapters.length) * 10000) / 100,
    new: newTestamentChapters.length === 0 ? 0 : Math.round((newRead / newTestamentChapters.length) * 10000) / 100
  };

  const stats = {
    overallProgress,
    dailyAverage,
    estimatedCompletion,
    readingStreak,
    booksCompleted,
    testamentProgress,
    totalChapters: total,
    readChapters: read,
    firstReadDate
  };

  return { stats, displayedStats: user_settings.displayedStats, dailyGoal: user_settings.dailyGoal };
}

function nextUnreadChapter(state) {
  for (const book of booksData) {
    for (let i = 1; i <= book.totalChapters; i += 1) {
      const id = `${book.id}-${i}`;
      const chapter = state.chapters[id];
      if (chapter && !chapter.isRead) {
        return { ...chapter, bookName: book.name };
      }
    }
  }
  return null;
}

function serializeBook(book, state) {
  const chapters = Object.values(state.chapters)
    .filter((c) => c.bookId === book.id)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);
  const readCount = chapters.filter((c) => c.isRead).length;
  const percent = Math.round((readCount / chapters.length) * 10000) / 100;
  return {
    ...book,
    progress: { read: readCount, total: chapters.length, percent },
    chapters
  };
}

async function handleApi(req, res, parsedUrl) {
  const state = loadState();
  const { pathname } = parsedUrl;

  if (req.method === 'GET' && pathname === '/api/books') {
    const books = booksData.map((b) => serializeBook(b, state));
    return sendJson(res, 200, { books });
  }

  if (req.method === 'GET' && pathname.startsWith('/api/books/')) {
    const id = pathname.split('/')[3];
    const book = booksData.find((b) => b.id === id);
    if (!book) return sendJson(res, 404, { error: 'Book not found' });
    return sendJson(res, 200, { book: serializeBook(book, state) });
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/chapters/')) {
    const id = pathname.split('/')[3];
    const chapter = state.chapters[id];
    if (!chapter) return sendJson(res, 404, { error: 'Chapter not found' });

    const updated = { ...chapter, isRead: !chapter.isRead, readAt: chapter.isRead ? null : new Date().toISOString() };
    state.chapters[id] = updated;

    if (updated.isRead) {
      state.reading_history.push({ chapterId: updated.id, readAt: updated.readAt });
    } else {
      state.reading_history = state.reading_history.filter((entry) => entry.chapterId !== updated.id);
    }

    saveState(state);
    return sendJson(res, 200, { chapter: updated, next: nextUnreadChapter(state), stats: computeStats(state) });
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/books/') && pathname.endsWith('/mark-all')) {
    const [, , , bookId] = pathname.split('/');
    const body = await readBody(req);
    const book = booksData.find((b) => b.id === bookId);
    if (!book) return sendJson(res, 404, { error: 'Book not found' });
    const markRead = body?.markRead !== false;

    for (let i = 1; i <= book.totalChapters; i += 1) {
      const chapterId = `${book.id}-${i}`;
      const chapter = state.chapters[chapterId];
      if (!chapter) continue;
      if (markRead && !chapter.isRead) {
        const readAt = new Date().toISOString();
        state.chapters[chapterId] = { ...chapter, isRead: true, readAt };
        state.reading_history.push({ chapterId, readAt });
      }
      if (!markRead && chapter.isRead) {
        state.chapters[chapterId] = { ...chapter, isRead: false, readAt: null };
        state.reading_history = state.reading_history.filter((entry) => entry.chapterId !== chapterId);
      }
    }

    saveState(state);
    return sendJson(res, 200, { book: serializeBook(book, state), next: nextUnreadChapter(state), stats: computeStats(state) });
  }

  if (req.method === 'GET' && pathname === '/api/next-chapter') {
    return sendJson(res, 200, { next: nextUnreadChapter(state) });
  }

  if (req.method === 'GET' && pathname === '/api/stats') {
    return sendJson(res, 200, computeStats(state));
  }

  if (req.method === 'GET' && pathname === '/api/settings') {
    return sendJson(res, 200, state.user_settings);
  }

  if (req.method === 'PATCH' && pathname === '/api/settings') {
    const body = await readBody(req);
    const allowedKeys = ['displayedStats', 'theme', 'dailyGoal', 'viewPreference'];
    allowedKeys.forEach((key) => {
      if (body[key] !== undefined) {
        state.user_settings[key] = body[key];
      }
    });
    saveState(state);
    return sendJson(res, 200, state.user_settings);
  }

  if (req.method === 'GET' && pathname === '/api/export') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="progress.json"'
    });
    return res.end(JSON.stringify(state, null, 2));
  }

  return false;
}

function serveStatic(res, pathname) {
  const filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname.replace(/^\//, ''));
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    const ext = path.extname(resolved).toLowerCase();
    const mime = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript'
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(resolved).pipe(res);
    return true;
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname.startsWith('/api/')) {
    try {
      const handled = await handleApi(req, res, parsedUrl);
      if (handled === false) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server error' }));
    }
    return;
  }

  const served = serveStatic(res, parsedUrl.pathname);
  if (!served) {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexPath).pipe(res);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Bible Reader Tracker running on http://localhost:${PORT}`);
});
