# Bible Reader Tracker

A personalized Bible reading companion that tracks your progress, highlights the next unread chapter, and keeps your statistics up to date.

## Getting started

```bash
npm install  # no external dependencies are required, but this keeps node scripts usable
npm run start
```

The server starts on [http://localhost:3000](http://localhost:3000) with zero external runtime dependencies.

## Features
- Quick access search bar covering all 66 books and chapters
- "Next chapter" quick-track banner for one-click completion
- Toggleable stat cards (overall progress, daily average, estimated completion, streak, books finished, testament progress)
- Accordion book list with per-chapter toggles and a "mark all read" shortcut
- Settings modal for stat visibility, theme, daily goal, view preference, and data export
- JSON persistence in `data/state.json`
