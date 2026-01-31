# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that opens starred Inoreader articles in background tabs when the user presses the 'w' key. Based on [feedly-star-opener-ext](https://github.com/src256/feedly-star-opener-ext). Documentation is primarily in Japanese.

## Development Commands

```bash
npm run format          # Format JS/JSON files with Prettier
npm run format:check    # Check formatting without modifying
```

No build step required — the extension is vanilla JavaScript loaded directly as an unpacked Chrome extension via `chrome://extensions/`.

No automated test framework exists. Testing is manual (see TESTING.md for procedures). Debug mode can be enabled by setting `DEBUG = true` in `js/contentscripts.js` and observing browser console output.

## Architecture

Three-component Chrome Extension Manifest V3 architecture:

- **background.js** — Service worker that manages settings via `chrome.storage.local`. Handles `getOptions`/`setOptions` messages with validation (tab count 1–20, default 8).
- **js/contentscripts.js** — Injected into inoreader.com pages. Listens for 'w' keypress, finds starred articles using a cascade of CSS selectors (magazine view prioritized), opens them in background tabs via `window.open()`, and unstars them by dispatching MouseEvent to star buttons. Uses `dispatchEvent()` instead of `.click()` to comply with CSP.
- **js/options.js** + **html/options.html** — Settings UI for configuring the number of tabs to open. Communicates with background via `chrome.runtime.sendMessage`.

Data flow: keypress → content script requests options from background → background reads chrome.storage → content script finds article links → opens tabs + dispatches unstar events.

## Key Technical Notes

- CSS selectors in contentscripts.js are fragile — they depend on Inoreader's DOM structure and may break when Inoreader updates its layout. Multiple fallback selectors are used.
- Star state detection checks for `.star_full` with `.icon-yellow` class combination.
- Prettier config: semicolons, es5 trailing commas, single quotes, 80 char width, 2-space indent (`.prettierrc`). Markdown files are excluded from formatting (`.prettierignore`).
