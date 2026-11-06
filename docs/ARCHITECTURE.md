# Smart City Reporter - Architecture & Technical Specification

## 1. System Overview
**Smart City Reporter** (Civic-I) is an AI-assisted, mobile-responsive civic issue reporting progressive web application designed for Palghar City, Maharashtra. It empowers citizens to photograph, classify, and geolocate urban infrastructure issues (potholes, broken street lights, garbage, damaged bridges, and other civic hazards), while maintaining rigorous human oversight, local AI privacy, and client-side data governance.

---

## 2. Technology Stack & Architectural Decisions
- **Frontend Framework:** React 18 with Vite for rapid HMR and optimized asset bundling.
- **Styling:** Tailwind CSS with a dark modern aesthetic (zinc/slate backgrounds, high-contrast text, civic alert accents).
- **Navigation:** React Router DOM (v6) with desktop top navigation and mobile bottom navigation.
- **Animations:** Framer Motion for page transitions, step wizards, staggered card reveals, and animated level progress bars.
- **Icons:** Lucide React.
- **Authentication:** Firebase Authentication (Google Sign-In only). When Firebase configuration is absent or invalid, the app provides a clearly marked `[DEMO]` sign-in mechanism.
- **Mapping:** `@vis.gl/react-google-maps` utilizing modern Google Maps Platform JavaScript API (`APIProvider`, `Map`, `AdvancedMarker`, `Pin`, and `useMapsLibrary("geocoding")`).
- **Local AI:** Ollama running locally (`/ollama -> http://localhost:11434` Vite reverse proxy) calling `/api/chat` with base64 downscaled images and JSON-constrained responses.
- **Storage:** Browser `localStorage` abstraction (`src/services/storage.js`) featuring HTML5 Canvas image downscaling (< 800px JPEG) and graceful `QuotaExceededError` handling.
- **Gamification:** Pure module (`src/services/gamification.js`) calculating points, tier levels, badge awards, and browser-local leaderboard standings.

---

## 3. Data Flow & LocalStorage Architecture

```
[Citizen Action: Photo Capture]
             │
             ▼
[Canvas Downscaling (< 800px)] ──────────┐
             │                           │
             ▼                           ▼
[Local Ollama API (/ollama)]     [Client State (Memory)]
             │                           │
             ▼                           │
[AI Classification Suggestion]           │
             │                           │
             ▼                           │
[Citizen Confirmation/Correction]        │
             │                           │
             ▼                           │
[Google Maps Geocoding & Pinning] ───────┤
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
     "photo": "data:image/jpeg;base64,...",
     "location": {
       "lat": 19.6967,
       "lng": 72.7699,
       "address": "Station Rd, Palghar, Maharashtra 401404",
       "hasGPS": true
     },
     "aiSuggestion": {
       "type": "pothole",
       "confidence": 0.94,
       "summary": "Deep asphalt deterioration and road surface depression.",
       "confirmedByUser": true
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
All rules exist in a pure functional module for strict automated unit testing.

### Point Rules
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

### Badges Catalog
- `first_report`: **First Step** — Submitted your first civic issue report.
- `reporter_3`: **Eagle Eye** — Submitted 3 or more civic reports.
- `geo_scout`: **Geo Scout** — Geotagged an issue with accurate GPS or pin location.
- `ai_partner`: **AI Partner** — Accepted an AI visual classification suggestion.
- `problem_solver`: **Problem Solver** — Had an issue successfully resolved.
- `city_guardian`: **City Guardian** — Attained Level 3 civic status.

---

## 5. Google Maps Platform Integration & Security
The application leverages the official `@vis.gl/react-google-maps` package:
- **`APIProvider`:** Placed strictly around map-dependent routes (`Dashboard`, `Report`) to avoid unnecessary script loading on the authentication screen.
- **`Map` & `AdvancedMarker`:** Uses modern vector/raster map rendering with `mapId` (defaulting to `"DEMO_MAP_ID"` for development).
- **`Pin` Component:** Dynamic pin rendering with color coding:
  - Pothole: Amber-orange (`#f97316`)
  - Broken Street Light: Yellow (`#eab308`)
  - Garbage: Red (`#ef4444`)
  - Damaged Bridge: Purple (`#a855f7`)
  - Other: Blue (`#3b82f6`)
- **Interactive Location Pinning:** Draggable `AdvancedMarker` on the Report screen updating coordinates and reverse-geocoding via `google.maps.Geocoder`.
- **Fault Tolerance:**
  - Detects missing API key and renders an accessible fallback address form.
  - Registers `window.gm_authFailure` globally before script initialization to capture unauthorized referrers, disabled billing, or missing APIs gracefully without React unhandled exceptions.

### Google Cloud Setup Guide
1. **Create Project:** Open [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2. **Enable Billing:** Attach a billing account (required by Google Maps Platform even within the monthly free credit tier).
3. **Enable APIs:** Enable **Maps JavaScript API** and **Geocoding API**.
4. **Create Credentials:** Generate an API Key in Credentials.
5. **Key Restrictions:**
   - **Application Restriction:** HTTP referrers (e.g., `http://localhost:3000/*` for local Vite dev).
   - **API Restriction:** Restrict key to *Maps JavaScript API* and *Geocoding API*.
6. **Map ID:** In Google Cloud Console > Map Management, create a Map ID with "JavaScript" and "Vector/Raster" enabled.

---

## 6. Local AI Specification (Ollama)
- **Endpoint:** POST `/ollama/api/chat` (proxied by Vite dev server to `http://localhost:11434/api/chat`).
- **Model:** Dynamically read from `import.meta.env.VITE_OLLAMA_MODEL`.
- **System Prompt:**
  ```text
  You are a city infrastructure inspector for Palghar City. Analyze the provided image and classify the civic issue into exactly one of: 'pothole', 'broken_street_light', 'garbage', 'damaged_bridge', 'other'.
  Output valid JSON only with keys: type, confidence (0.0 - 1.0), and summary (one concise sentence).
  ```
- **Fallback Policy:** If Ollama is unavailable, the model is unpulled, or network fails, the user is presented with a non-intrusive banner and the manual category selector is pre-focused.

