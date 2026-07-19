# SpeakAgain Desktop Prototype

SpeakAgain is a desktop-friendly speech practice app for aphasia home therapy support. It includes picture-based word practice, daily phrase repetition, comprehension matching, text-to-speech prompts, browser speech recognition, caregiver notes, and local progress tracking.

For project flow, code logic, APIs, and tech stack, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

## Run

```bash
npm start
```

Then open:

```text
http://localhost:5179
```

Speech recognition works best in Chrome or Edge on `localhost`. Progress is saved in the browser with `localStorage`.

## Windows note

This project runs with Node.js only. If PowerShell shows a Python error, update to the latest project files and run `npm start` again. You can also double-click `Start SpeakAgain Windows.bat`.
