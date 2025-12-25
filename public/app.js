const nextContainer = document.getElementById('next-chapter');
const statsGrid = document.getElementById('stats-grid');
const booksContainer = document.getElementById('books-container');
const searchInput = document.getElementById('book-search');
const searchResults = document.getElementById('search-results');
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const statsToggleList = document.getElementById('stats-toggle-list');
const themeSelect = document.getElementById('theme-select');
const dailyGoalInput = document.getElementById('daily-goal');
const viewPreferenceSelect = document.getElementById('view-preference');
const exportButton = document.getElementById('export-data');
const viewToggle = document.getElementById('view-toggle');

let appState = {
  books: [],
  settings: null,
  stats: null,
  next: null
};

let searchIndex = [];
let searchEventsAttached = false;

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function loadData() {
  const [booksResponse, settings, statsResponse, nextResponse] = await Promise.all([
    fetchJSON('/api/books'),
    fetchJSON('/api/settings'),
    fetchJSON('/api/stats'),
    fetchJSON('/api/next-chapter')
  ]);

  appState.books = booksResponse.books;
  appState.settings = settings;
  appState.stats = statsResponse;
  appState.next = nextResponse.next;

  applyTheme();
  renderViewToggle();
  renderStatsToggles();
  renderNext();
  renderStats();
  renderBooks();
  buildSearchIndex();
}

function applyTheme() {
  document.body.classList.toggle('dark', appState.settings?.theme === 'dark');
  themeSelect.value = appState.settings?.theme || 'light';
  dailyGoalInput.value = appState.settings?.dailyGoal || 1;
  viewPreferenceSelect.value = appState.settings?.viewPreference || 'expanded';
}

function renderNext() {
  nextContainer.innerHTML = '';
  if (!appState.next) {
    nextContainer.innerHTML = '<p>All chapters complete 🎉</p>';
    return;
  }

  const title = document.createElement('div');
  title.innerHTML = `<p class="next-title">Next: ${appState.next.bookName} ${appState.next.chapterNumber}</p><small>Chronological order</small>`;

  const button = document.createElement('button');
  button.textContent = 'Read this chapter';
  button.addEventListener('click', async () => {
    await toggleChapter(appState.next.id);
  });

  nextContainer.append(title, button);
}

const statLabels = {
  overallProgress: 'Overall Progress',
  dailyAverage: 'Daily Average',
  estimatedCompletion: 'Estimated Completion',
  readingStreak: 'Reading Streak',
  booksCompleted: 'Books Completed',
  testamentProgress: 'Testament Progress'
};

function renderStatCard(key) {
  const card = document.createElement('div');
  card.className = 'stat-card';
  card.innerHTML = `<h4>${statLabels[key] ?? key}</h4>`;

  const { stats } = appState.stats;
  switch (key) {
    case 'overallProgress': {
      card.innerHTML += `<div class="progress-bar"><span style="width:${stats.overallProgress}%"></span></div><strong>${formatPercent(stats.overallProgress)}</strong>`;
      break;
    }
    case 'dailyAverage': {
      card.innerHTML += `<strong>${stats.dailyAverage ?? 0} chapters/day</strong>`;
      if (appState.settings?.dailyGoal) {
        card.innerHTML += `<p class="muted">Goal: ${appState.settings.dailyGoal}/day</p>`;
      }
      break;
    }
    case 'estimatedCompletion': {
      card.innerHTML += `<strong>${stats.estimatedCompletion ?? '—'}</strong>`;
      break;
    }
    case 'readingStreak': {
      card.innerHTML += `<strong>${stats.readingStreak} day${stats.readingStreak === 1 ? '' : 's'}</strong>`;
      break;
    }
    case 'booksCompleted': {
      card.innerHTML += `<strong>${stats.booksCompleted} of 66</strong>`;
      break;
    }
    case 'testamentProgress': {
      card.innerHTML += `
        <p class="muted">Old Testament</p>
        <div class="progress-bar"><span style="width:${stats.testamentProgress.old}%"></span></div>
        <p class="muted">New Testament</p>
        <div class="progress-bar"><span style="width:${stats.testamentProgress.new}%"></span></div>
      `;
      break;
    }
    default:
      card.innerHTML += '<strong>Not available</strong>';
  }

  return card;
}

function renderStats() {
  statsGrid.innerHTML = '';
  if (!appState.stats) return;

  appState.settings.displayedStats.forEach((key) => {
    statsGrid.appendChild(renderStatCard(key));
  });
}

function renderStatsToggles() {
  statsToggleList.innerHTML = '';
  Object.entries(statLabels).forEach(([key, label]) => {
    const id = `stat-${key}`;
    const wrapper = document.createElement('label');
    wrapper.innerHTML = `<input type="checkbox" id="${id}" ${appState.settings.displayedStats.includes(key) ? 'checked' : ''}/> ${label}`;
    wrapper.querySelector('input').addEventListener('change', (e) => {
      const list = new Set(appState.settings.displayedStats);
      if (e.target.checked) list.add(key);
      else list.delete(key);
      updateSettings({ displayedStats: Array.from(list) });
    });
    statsToggleList.appendChild(wrapper);
  });
}

function accordionBody(openByDefault) {
  const body = document.createElement('div');
  body.className = `accordion-body ${openByDefault ? 'open' : ''}`;
  return body;
}

function renderBook(book) {
  const accordion = document.createElement('div');
  accordion.className = 'book-accordion';
  accordion.dataset.bookId = book.id;

  const header = document.createElement('div');
  header.className = 'book-header';

  const title = document.createElement('div');
  title.className = 'book-title';
  title.innerHTML = `<strong>${book.name}</strong><span>${book.progress.read}/${book.progress.total} read (${formatPercent(book.progress.percent)})</span>`;

  const actions = document.createElement('div');
  actions.className = 'book-actions';

  const markButton = document.createElement('button');
  markButton.className = 'ghost';
  markButton.textContent = 'Mark all read';
  markButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    await fetchJSON(`/api/books/${book.id}/mark-all`, { method: 'PATCH', body: JSON.stringify({ markRead: true }) });
    await loadData();
  });

  actions.appendChild(markButton);
  header.append(title, actions);

  const body = accordionBody(appState.settings.viewPreference === 'expanded');

  header.addEventListener('click', () => {
    body.classList.toggle('open');
  });

  const grid = document.createElement('div');
  grid.className = 'chapter-grid';
  book.chapters.forEach((chapter) => {
    const btn = document.createElement('button');
    btn.className = `chapter-btn ${chapter.isRead ? 'read' : ''}`;
    btn.textContent = chapter.chapterNumber;
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await toggleChapter(chapter.id);
    });
    grid.appendChild(btn);
  });

  body.appendChild(grid);
  accordion.append(header, body);
  return accordion;
}

function renderBooks() {
  booksContainer.innerHTML = '';
  const old = appState.books.filter((b) => b.testament === 'Old');
  const newTestament = appState.books.filter((b) => b.testament === 'New');

  const createGroup = (label, list) => {
    const wrapper = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = label;
    wrapper.appendChild(heading);
    list.forEach((book) => wrapper.appendChild(renderBook(book)));
    booksContainer.appendChild(wrapper);
  };

  createGroup('Old Testament', old);
  createGroup('New Testament', newTestament);
}

async function toggleChapter(id) {
  await fetchJSON(`/api/chapters/${id}/toggle`, { method: 'PATCH' });
  await loadData();
}

function buildSearchIndex() {
  searchIndex = [];
  appState.books.forEach((book) => {
    searchIndex.push({ label: book.name, value: book.id, type: 'book' });
    book.chapters.forEach((c) => {
      searchIndex.push({ label: `${book.name} ${c.chapterNumber}`, value: c.id, type: 'chapter', bookId: book.id });
    });
  });

  const filterAndRender = (query) => {
    const lower = query.toLowerCase();
    const results = searchIndex.filter((item) => item.label.toLowerCase().includes(lower)).slice(0, 20);
    searchResults.innerHTML = '';
    if (!query) {
      searchResults.classList.remove('visible');
      return;
    }
    results.forEach((item) => {
      const button = document.createElement('button');
      button.textContent = item.label;
      button.addEventListener('click', () => {
        handleJump(item);
        searchResults.classList.remove('visible');
        searchInput.value = '';
      });
      searchResults.appendChild(button);
    });
    searchResults.classList.toggle('visible', results.length > 0);
  };

  if (!searchEventsAttached) {
    searchInput.addEventListener('input', (e) => filterAndRender(e.target.value));
    document.addEventListener('click', (e) => {
      if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.classList.remove('visible');
      }
    });
    searchEventsAttached = true;
  }
}

function handleJump(item) {
  if (item.type === 'book') {
    const target = document.querySelector(`[data-book-id="${item.value}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const body = target?.querySelector('.accordion-body');
    body?.classList.add('open');
  } else if (item.type === 'chapter') {
    const [bookId] = item.value.split('-');
    const target = document.querySelector(`[data-book-id="${bookId}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const body = target?.querySelector('.accordion-body');
    body?.classList.add('open');
  }
}

function renderViewToggle() {
  viewToggle.innerHTML = '';
  const compactBtn = document.createElement('button');
  compactBtn.textContent = 'Compact';
  compactBtn.addEventListener('click', () => updateSettings({ viewPreference: 'compact' }));

  const expandedBtn = document.createElement('button');
  expandedBtn.textContent = 'Expanded';
  expandedBtn.addEventListener('click', () => updateSettings({ viewPreference: 'expanded' }));

  viewToggle.append(compactBtn, expandedBtn);
}

async function updateSettings(partial) {
  await fetchJSON('/api/settings', { method: 'PATCH', body: JSON.stringify(partial) });
  await loadData();
}

settingsButton.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add('hidden');
  }
});

themeSelect.addEventListener('change', (e) => updateSettings({ theme: e.target.value }));
dailyGoalInput.addEventListener('change', (e) => updateSettings({ dailyGoal: Number(e.target.value) || 1 }));
viewPreferenceSelect.addEventListener('change', (e) => updateSettings({ viewPreference: e.target.value }));

exportButton.addEventListener('click', async () => {
  const res = await fetch('/api/export');
  const data = await res.json();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'progress.json';
  a.click();
  URL.revokeObjectURL(url);
});

loadData().catch((err) => {
  console.error(err);
  nextContainer.innerHTML = '<p>Failed to load data.</p>';
});
