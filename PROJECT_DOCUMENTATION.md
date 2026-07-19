# SpeakAgain Project Documentation

## 1. Project Overview

SpeakAgain is a desktop-friendly speech practice application for aphasia patients. Aphasia can affect speaking, understanding, reading, and writing, commonly after stroke or brain injury. The app supports home practice through picture prompts, voice guidance, speech recognition, and progress tracking.

SpeakAgain is a support tool, not a replacement for professional speech therapy.

## 2. Main Features

- Picture-based word practice
- Daily phrase practice
- Picture meaning matching
- Text-to-speech guidance
- Microphone-based speech recognition
- Pronunciation similarity scoring
- Daily goal tracking
- Accuracy, streak, and practice-minute stats
- Session log
- Caregiver notes
- Large text mode
- Slower voice mode
- Local browser progress storage

## 3. Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | HTML5 | Page structure and app layout |
| Styling | CSS3 | Desktop UI, responsive layout, accessibility-friendly controls |
| Logic | Vanilla JavaScript | Exercise flow, speech handling, scoring, rendering, persistence |
| Local Server | Node.js static server | Serves the app locally on `http://127.0.0.1:5179` |
| Storage | Browser `localStorage` | Saves history, settings, goal, and notes |
| Speech Output | Web Speech API | Reads prompts aloud |
| Speech Input | Web Speech API | Converts patient speech into text |

The app does not currently use React, Next.js, Firebase, OpenAI API, a database, or a backend REST API.

## 4. APIs Used

### Text-To-Speech

Used API:

```js
SpeechSynthesisUtterance
window.speechSynthesis.speak()
```

Purpose:

The app reads selected words and phrases aloud so the patient can listen before speaking.

Main code:

```js
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = state.slowVoice ? 0.72 : 0.9;
  window.speechSynthesis.speak(utterance);
}
```

### Speech Recognition

Used API:

```js
window.SpeechRecognition
window.webkitSpeechRecognition
```

Purpose:

The app listens to the user through the microphone and receives a text transcript of the spoken answer.

Main code:

```js
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
```

Browser notes:

- Works best in Chrome or Edge.
- Requires microphone permission.
- Requires `localhost` or HTTPS.
- Some browsers may use vendor speech services internally.

### Local Storage

Used API:

```js
localStorage.getItem()
localStorage.setItem()
```

Purpose:

The app saves progress and settings locally in the browser.

Saved data includes:

- Current section
- Exercise indexes
- Daily goal
- Practice history
- Caregiver notes
- Large text setting
- Slow voice setting

## 5. Project File Structure

```text
speakagain-desktop/
  index.html
  styles.css
  app.js
  package.json
  README.md
  PROJECT_DOCUMENTATION.md
  Start SpeakAgain.command
  Start SpeakAgain Windows.bat
  server.js
  assets/
    apple.svg
    book.svg
    chair.svg
    cup.svg
    phone.svg
    water.svg
```

| File | Responsibility |
| --- | --- |
| `index.html` | Defines the sidebar, topbar, stats cards, practice stage, log, and notes UI |
| `styles.css` | Controls layout, colors, buttons, cards, responsive behavior, and accessibility states |
| `app.js` | Contains exercise data, state management, rendering, speech logic, scoring, and event handlers |
| `assets/*.svg` | Picture prompts for exercises |
| `package.json` | Contains the local start script |
| `server.js` | Serves the static files locally using Node.js |
| `Start SpeakAgain.command` | macOS launcher for starting the app |
| `Start SpeakAgain Windows.bat` | Windows launcher for starting the app |

## 6. Application Working Flow

```text
User opens app
  -> index.html loads styles.css and app.js
  -> init() starts the application
  -> saved state loads from localStorage
  -> current practice section renders
  -> user clicks Listen
  -> browser text-to-speech reads the prompt
  -> user clicks Speak
  -> browser speech recognition listens through microphone
  -> transcript is returned to JavaScript
  -> transcript is compared with the expected answer
  -> score and feedback are shown
  -> attempt is saved in localStorage
  -> stats, goal meter, progress, and session log update
```

## 7. Code Logic

### Initialization

Function:

```js
init()
```

Responsibilities:

- Sets today's date label
- Loads caregiver notes
- Applies saved settings
- Hydrates icons
- Binds global events
- Renders stats, log, and current practice section

### State Management

Functions:

```js
loadState()
saveState()
```

`loadState()` reads saved data from `localStorage`. If no saved state exists, it returns default values.

`saveState()` writes the latest app state back to `localStorage`.

### Section Rendering

Function:

```js
renderCurrentSection()
```

This function decides which screen to show:

| Section | Function |
| --- | --- |
| Picture Words | `renderWords()` |
| Daily Phrases | `renderPhrases()` |
| Match Meaning | `renderMatching()` |
| Progress | `renderProgress()` |

### Picture Word Practice

Function:

```js
renderWords()
```

Flow:

1. Selects a word from `pictureWords`.
2. Shows image, word, category, cue, and sample phrase.
3. Lets the user listen to the word and phrase.
4. Lets the user speak the word.
5. Scores the spoken answer.
6. Saves the attempt.

### Daily Phrase Practice

Function:

```js
renderPhrases()
```

Flow:

1. Selects a phrase from `phrases`.
2. Shows the phrase and focus area.
3. Reads the phrase aloud.
4. Captures the spoken response.
5. Scores and saves the result.

### Match Meaning

Function:

```js
renderMatching()
```

Flow:

1. Selects a target word.
2. Shows three picture choices.
3. User selects the matching picture.
4. Correct answer gets `100%`; incorrect answer gets `0%`.
5. Result is saved in history.

### Progress View

Function:

```js
renderProgress()
```

Flow:

1. Reads saved practice history.
2. Calculates average score by activity type.
3. Shows skill bars and recent attempts.

## 8. Speech Scoring Logic

Main function:

```js
scoreSpeech(transcript, expected, accepted)
```

The scoring system uses:

- Lowercase normalization
- Punctuation removal
- Article removal such as `a`, `an`, and `the`
- Exact match checking
- Partial phrase checking
- Accepted alternatives
- Word overlap
- Levenshtein distance

The output is a percentage score from `0` to `100`.

Feedback is generated by:

```js
feedbackForScore(score, transcript, expected)
```

| Score | Feedback |
| --- | --- |
| 85-100 | Clear response |
| 60-84 | Close response |
| 0-59 | Keep practicing |

## 9. Progress Logic

Practice attempts are saved by:

```js
addHistory(entry)
```

Each history item stores:

- Mode
- Target word or phrase
- Transcript or selected answer
- Score
- Correct status
- Date
- Time
- Duration

Stats are updated by:

```js
renderStats()
```

It calculates:

- Today's completed attempts
- Average accuracy
- Practice streak
- Practice minutes
- Daily goal progress

## 10. Data Storage

Storage key:

```js
const STORAGE_KEY = "speakagain-desktop-state-v1";
```

All data is stored in the browser on the same desktop. There is no cloud sync in the current version.

## 11. How To Run

Using Terminal:

```bash
cd /Users/vakilsearch/Desktop/vs-repos/speakagain-desktop
npm start
```

Open:

```text
http://127.0.0.1:5179
```

Or double-click:

```text
Start SpeakAgain.command
```

## 12. Limitations

- Speech recognition support depends on the browser.
- Microphone permission is required.
- Accuracy may vary by accent, speech clarity, background noise, and microphone quality.
- Progress is saved only in the current browser.
- There is no login system.
- There is no therapist dashboard.
- This prototype is not a certified medical device.

## 13. Future Enhancements

- Therapist dashboard
- Caregiver login
- Cloud progress sync
- Custom word lists
- Difficulty levels
- Multilingual practice
- Exportable progress reports
- Reminder notifications
- Offline speech recognition
- Therapist-assigned exercise plans

## 14. Conclusion

SpeakAgain is a simple desktop speech practice prototype for aphasia support. It uses HTML, CSS, JavaScript, and browser speech APIs to provide guided word and phrase practice at home. The current version runs locally, stores progress in the browser, and avoids external APIs or backend dependencies.
