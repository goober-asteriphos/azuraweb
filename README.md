# AzuraWave 📻 (SiriusXM-Inspired AzuraCast Web Client for iPhone)

AzuraWave is a sleek, modern mobile Progressive Web App (PWA) client for [AzuraCast](https://www.azuracast.com/) radio stations, engineered specifically for **iPhone (iOS Safari)** with the premium look, feel, and navigation of the **SiriusXM mobile app**.

---

## ✨ Features

### 📡 SiriusXM-Inspired Experience
- **Channel Numbering & Badges**: Distinct channel numerals (e.g. `CH 01`, `CH 37`), category tags (`Pop & Hits`, `Rock`, `Electronic`, `Decades`, etc.), and custom accent glows.
- **Top Category Filter Pills**: Horizontal scroll bar for instantaneous filtering by genres or favorites.
- **Featured Hero Banner**: Prominent banner showcasing active on-air broadcasts with dynamic blurred cover art.
- **Persistent Floating Mini-Player**: Docked above the bottom bar with live track progress, animated sound bars, live DJ indicators, and fast channel skipping.
- **Full-Screen Slide-Up Now Playing Sheet**:
  - High-resolution squircle album artwork with dynamic background ambient glow.
  - Pulsing `● LIVE` badge with streamer/DJ name and listener counter.
  - Live track progress scrubber synchronized with AzuraCast `elapsed` / `duration` metadata.
  - Quick 15s rewind & jump-to-live edge button.
  - Direct Song History ("Recently Played") drawer.
  - On-demand Song Requests sheet connecting directly to AzuraCast's request API.
  - Built-in Sleep Timer (15, 30, 45, 60, 90 mins) with fade out.
  - Multi-mount bitrate switcher (e.g., 320k MP3 vs. 128k AAC).

### 📱 Optimized Specifically for iPhone & iOS Safari
- **Native iOS PWA Support**: Full-screen standalone mode (`apple-mobile-web-app-capable`, `black-translucent` status bar) eliminating Safari address bars.
- **Safe Area Inset Handling**: Automatically respects the iPhone Notch, Dynamic Island, and Home Bar (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`).
- **iOS Lock Screen & Control Center Integration (MediaSession API)**:
  - Displays high-res album artwork, song title, artist, and station name on the iPhone Lock Screen and Apple Watch.
  - Lock screen transport controls (Play, Pause, Next Channel, Previous Channel).
  - Background audio playback keeps streaming even when the screen is locked or while multitasking.
- **Haptic Touch Feedback**: Subtle touch response when favoriting stations.

### ⚡ AzuraCast Live Integration
- **Zero-Setup Demo Mode**: Pre-loaded with realistic stations and working streams out of the box.
- **Direct Server Connection**: In-app Settings modal to input your AzuraCast server URL (e.g., `https://radio.yourdomain.com`) with an instant connection tester.
- **High-Performance Now Playing (SSE)**: Automatically connects to `/api/live/nowplaying/sse` with fallback to REST polling.
- **Interactive Song Requests**: Listeners can search your station library and submit song requests directly from the app.

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm install
npm run dev
```

### 2. Connect Your AzuraCast Instance
You can connect your AzuraCast instance in two easy ways:

1. **Directly in the App**:
   - Open the web app on your iPhone or browser.
   - Tap the **Settings** gear in the top right.
   - Toggle off **Demo Mode** and enter your AzuraCast URL (e.g. `https://radio.example.com`).
   - Tap **Test Server Connection** and then **Save & Connect**.

2. **Via Environment Variable**:
   Create a `.env` file in the root directory:
   ```env
   VITE_AZURACAST_BASE_URL=https://radio.example.com
   ```

---

## 📲 Installing on Your iPhone

1. Open Safari on your iPhone and navigate to your deployed AzuraWave web app.
2. Tap the **Share** button (box with an arrow pointing up) at the bottom of Safari.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right corner.
5. Launch AzuraWave from your iPhone Home Screen to enjoy the full fullscreen native experience with lock-screen audio playback!

---

## 🛠️ AzuraCast CORS & Streaming Tips
- AzuraCast by default allows public read access to `/api/nowplaying`.
- If your AzuraCast instance is on HTTPS (e.g. `https://radio.example.com`), make sure your AzuraWave web client is also served over HTTPS (or `localhost` during testing) to avoid mixed content restrictions.
- Ensure "Use High-Performance Now Playing Updates" is turned on in your AzuraCast *System Administration > Settings* for real-time SSE updates.
