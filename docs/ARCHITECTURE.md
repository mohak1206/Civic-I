# Smart City Reporter - Architecture & Technical Specification

## 1. System Overview
**Smart City Reporter** (Civic-I) is an AI-assisted, mobile-responsive civic issue reporting progressive web application designed for Palghar City, Maharashtra. It empowers citizens to photograph, classify, and geolocate urban infrastructure issues (potholes, street lights, garbage, damaged bridges, and other civic hazards), while maintaining rigorous human oversight, local AI privacy, and client-side data governance.

---

## 2. Technology Stack & Architectural Decisions
- **Frontend Framework:** React 18 with Vite for rapid HMR and optimized asset bundling.
- **Styling:** Tailwind CSS with a dark modern aesthetic (zinc/slate backgrounds, high-contrast text, civic alert accents).
- **Navigation:** React Router DOM (v6) with desktop top navigation and mobile bottom navigation.
- **Animations:** Framer Motion for page transitions, step wizards, staggered card reveals, and animated level progress bars.
- **Icons:** Lucide React.
- **Authentication:** Firebase Authentication (Google Sign-In only). When Firebase configuration is absent or invalid, the app provides a clearly marked `[DEMO]` sign-in mechanism.
- **Mapping:** Leaflet and `react-leaflet` with OpenStreetMap raster tiles. Zero API keys, zero billing accounts. Custom `L.divIcon` pins colored per category.
- **Geocoding:** OpenStreetMap Nominatim with strict 1 request/second throttling, custom User-Agent, and button-only manual trigger.
- **Dual Local Ollama Architecture:**
  1. **Vision Model (Gemma 3 4B):** Classifies photos into `pothole`, `street_light`, `garbage`, `bridge`, `other` with confidence and observation description.
  2. **Decision Model (Llama 3 Text):** Evaluates strictly text facts (safety risk, traffic exposure). Assigns `priority` (`low` | `medium` | `high`) and suggested municipal `department`. Never receives images, user names, or personal data.
- **Storage:** Browser `localStorage` abstraction (`src/services/storage.js`) featuring HTML5 Canvas image downscaling (< 640px JPEG) and graceful `QuotaExceededError` handling.
- **Gamification:** Pure module (`src/services/gamification.js`) calculating points, tier levels, badge awards, and browser-local leaderboard standings.

---

## 3. Data Flow & LocalStorage Architecture

```
[Citizen Action: Photo Capture]
             │
             ▼
[Canvas Downscaling (< 640px)] ──────────┐
             │                           │
             ▼                           ▼
[Gemma 3 Vision API (/ollama)]   [Client State (Memory)]
             │                           │
             ▼                           │
[Visual Classification Suggestion]       │
             │                           │
             ▼                           │
[Citizen Confirmation/Correction]        │
             │                           │
             ▼                           │
[Llama 3 Text Decision (/ollama)] ───────┤ (Strictly NO personal data / NO photo)
             │                           │
             ▼                           │
[Triage: Priority & Department]          │
             │                           │
             ▼                           │
[Citizen Review / Urgency Edit]          │
             │                           │
             ▼                           │
[Leaflet OSM Geocoding & Pinning] ───────┤
             │                           │
             ▼                           ▼
[Review & Final Submission] ───► [src/services/storage.js]
                                         │
                                         ▼
                               [Browser localStorage]
```

### LocalStorage Schema Keys
1. `civic_issues`: Array of issue objects:
   ```json
   {
     "id": "iss_1730889600000_abc",
     "type": "pothole",
     "title": "Severe pothole near Station Road",
     "description": "Deep crater damaging two-wheelers.",
     "priority": "high",
     "department": "roads department",
     "reason": "Immediate wheel damage hazard on high-traffic station approach.",
     "photo": "data:image/jpeg;base64,...",
     "location": {
       "lat": 19.6967,
       "lng": 72.7699,
       "address": "Station Rd, Palghar, Maharashtra 401404",
       "hasGPS": true
     },
     "aiClassification": {
       "model": "gemma3:4b",
       "type": "pothole",
       "confidence": 0.94,
       "description": "Deep asphalt deterioration and road surface depression.",
       "confirmedByUser": true
     },
     "aiActionDecision": {
       "model": "llama3",
       "priority": "high",
       "department": "roads department",
       "reason": "High vehicular volume with significant tire impact risk.",
       "summary": "Dispatch road maintenance assessment."
     },
     "status": "reported",
     "reporterId": "usr_demo_1",
     "reporterName": "Demo Citizen",
     "createdAt": "2026-11-06T10:30:00.000Z",
     "updatedAt": "2026-11-06T10:30:00.000Z",
     "pointsAwarded": 140
   }
   ```
2. `civic_current_user`: Active session user profile (`{ id, name, email, avatar, points, badges, isDemo }`).
3. `civic_users`: Registry of user profiles authenticated on this browser for the zero-fake-data Leaderboard.
4. `civic_notifications`: Notification logs (`{ id, title, message, type, date, read, link }`).

---

## 4. Gamification & Scoring Specification (`src/services/gamification.js`)
- **Base Submission:** `+100 points` for any verified issue report.
- **Location Bonus:** `+25 points` when coordinates are confirmed via GPS or map pin.
- **AI Agreement Bonus:** `+15 points` when confirming or keeping the AI-suggested category.
- **Resolution Bonus:** `+50 points` awarded to the reporter when the issue status changes to `resolved`.

### Level Progression
- **Level 1 (Civic Scout):** 0 - 199 XP
- **Level 2 (Neighborhood Watcher):** 200 - 499 XP
- **Level 3 (City Guardian):** 500 - 999 XP
- **Level 4 (Civic Champion):** 1000 - 1999 XP
- **Level 5 (Urban Legend):** 2000+ XP

---

## 5. Leaflet & OpenStreetMap Integration
- **Zero Cost / No API Key:** Removed Google Maps dependency entirely to eliminate billing hurdles.
- **Vite Marker Fix:** Explicitly imports default marker png assets (`marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`) and merges into `L.Icon.Default`.
- **Custom `L.divIcon` Pins:** SVG/CSS teardrop pins rendered in category theme colors:
  - Pothole: Orange (`#f97316`)
  - Street Light: Yellow (`#eab308`)
  - Garbage: Red (`#ef4444`)
  - Bridge: Purple (`#a855f7`)
  - Other: Blue (`#3b82f6`)
- **Nominatim Geocoding:**
  - Rate-limited to max 1 request/second.
  - Requires explicit user submission via "Search" button; never queries on keystroke.
  - Sends valid identifying `User-Agent`.
  - Fallback preserves user's typed text if geocoding yields no results.
- **Lazy Loading:** Map components are dynamically imported using `React.lazy` and `Suspense`, preventing Leaflet code from loading during login.

---

## 6. Dual Local AI Specification (Ollama)
- **Vite Proxy:** `/ollama -> http://localhost:11434`
- **Vision Model (Gemma 3 4B):**
  - Env var: `VITE_OLLAMA_VISION_MODEL=gemma3:4b`
  - Timeout: 60 seconds
  - Format: JSON
  - Classifies image into 5 standard classes.
- **Decision Model (Llama 3 Text):**
  - Env var: `VITE_OLLAMA_TEXT_MODEL=llama3`
  - Timeout: 30 seconds
  - Input: strictly factual text (type, description, location). NEVER personal data (name, email) or photo.
  - Generates priority, justification, and generic department suggestion.
- **Fallback Policy:** If Ollama is off or models unpulled, shows exact fix command (`ollama pull <model>`) while allowing manual user selection.

---

## 7. Architectural Decisions Log
1. **Replacement of Google Maps with Leaflet:** Eliminates billing requirements and proprietary API keys while preserving interactive draggable marker, address search, and popups.
2. **Dual Model Workflow:** Separating vision (Gemma 3 4B) and decision triage (Llama 3) ensures specialized accuracy and enforces strict privacy: user personal data is never visible to LLMs.
3. **Dual Data Logging:** Storing both initial AI outputs and confirmed user values permits objective measurement of model accuracy on real-world municipal reports.
4. **Backward Compatibility:** All existing issues without priority default to `"not set"` gracefully across filters, cards, and modal dialogs.
