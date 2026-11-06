# Civic-I: Smart City Reporter (Palghar City)

**Smart City Reporter** is an AI-assisted civic hazard reporting web application designed for the citizens and municipal authorities of **Palghar City, Maharashtra**. It allows residents to photograph, classify, and geolocate urban infrastructure issues—such as potholes, broken street lights, overflowing garbage, and damaged bridges—while ensuring human-in-the-loop verification, data privacy, and zero simulated backend claims.

---

## Key Features

1. **Photo Capture & Downscaling:** Citizen-facing photo capture with automatic in-browser Canvas compression (< 800px) preventing storage quota issues.
2. **Local AI Inspection (Ollama):** Calls a local vision-capable Ollama model (`POST /api/chat` through Vite proxy) to suggest the issue category with confidence score and observation summary. The AI output is explicitly labeled as a suggestion requiring human confirmation.
3. **Interactive Google Maps Pinning:** Powered by `@vis.gl/react-google-maps`, featuring a draggable `AdvancedMarker`, GPS auto-centering, geocoding search, and custom color-coded category pins.
4. **Resilient Offline / Keyless Fallbacks:** Full fallback mode for Google Maps (`gm_authFailure` and missing key) and Ollama (friendly manual category selector).
5. **Gamification & Rewards:** Pure functional scoring module (+100 base, +25 location, +15 AI confirmation, +50 resolution), 5 civic progression tiers, 6 badges, and a local leaderboard showing real browser sessions only.
6. **Polished Dark UI:** Mobile-first design with Tailwind CSS, Framer Motion transitions, desktop top navbar, and mobile bottom floating navigation.
7. **Simulation Controls:** Status transitions (reported → in review → in progress → resolved) clearly labeled with `[DEMO]` badges.

---

## Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM (v6), Framer Motion, Lucide React
- **Maps:** Google Maps Platform JavaScript API via `@vis.gl/react-google-maps`
- **Authentication:** Firebase Authentication (Google Sign-In) with fallback Demo Citizen sign-in
- **Local AI:** Ollama running locally at `http://localhost:11434`
- **Persistence:** Browser `localStorage` via unified abstraction in `src/services/storage.js`
- **Testing:** Vitest and Testing Library

---

## Google Cloud Platform Setup

To enable Google Maps integration:
1. **Google Cloud Project:** Navigate to [Google Cloud Console](https://console.cloud.google.com/) and create a project.
2. **Enable Billing:** A billing-enabled Google Cloud account is **strictly required** by Google Maps Platform, even though Google provides a recurring monthly free credit allowance. Verify current pricing and tiers on the Google Maps Platform pricing page.
3. **Enable APIs:** Enable both **Maps JavaScript API** and **Geocoding API**.
4. **Generate Credentials:** Go to **APIs & Services > Credentials** and create an **API Key**.
5. **Restrict API Key (Crucial):**
   - **Application Restriction:** Select *HTTP referrers (web sites)* and add `http://localhost:3000/*` for local development, along with your production domain.
   - **API Restriction:** Restrict key to *Maps JavaScript API* and *Geocoding API*.
6. **Budget Alerts & Quotas:** Configure a billing budget alert and set daily request quotas in Cloud Console to protect against runaway charges.
7. **Map ID:** Go to **Map Management** and create a Map ID with "JavaScript" and "Vector/Raster" enabled. You may also use the documented demo ID `DEMO_MAP_ID` for local testing.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example build/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key | *(leave blank for fallback)* |
| `VITE_GOOGLE_MAP_ID` | Vector map ID for Advanced Markers | `DEMO_MAP_ID` |
| `VITE_OLLAMA_MODEL` | Vision model installed in Ollama | `llava` or `llama3.2-vision` |
| `OLLAMA_BASE_URL` | Local Ollama endpoint | `http://localhost:11434` |
| `VITE_FIREBASE_API_KEY` | Firebase Auth Web API key | *(leave blank for demo login)* |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | *(leave blank for demo login)* |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | *(leave blank for demo login)* |

---

## Getting Started

### Prerequisites
- **Node.js:** v18+ or v20+
- **Ollama (Optional):** Install [Ollama](https://ollama.com/) locally and run `ollama run llava` or your preferred vision model.

### Installation & Run

```bash
cd build
npm install
npm test
npm run dev
```

The application runs on `http://localhost:3000`.

---

## Folder Map

```text
build/
├── index.html                 # App shell with global gm_authFailure handler
├── package.json               # Dependencies and build/test scripts
├── vite.config.js             # Vite configuration with /ollama proxy
├── tailwind.config.js         # Tailwind configuration
└── src/
    ├── components/
    │   ├── dashboard/         # StatsGrid, IssueCard, IssueFilters, IssueDetailModal
    │   ├── gamification/      # LevelCard, BadgeList, Leaderboard
    │   ├── layout/            # Navbar, BottomNav, PageContainer
    │   ├── map/               # IssuesDashboardMap, LocationPickerMap, MapFallback
    │   ├── notifications/     # NotificationCenter popover
    │   ├── report/            # PhotoCapture, AISuggestionBox
    │   └── ui/                # Button, Card, Badge, ProgressBar, Modal
    ├── context/               # AuthContext, NotificationContext
    ├── pages/                 # Login, Dashboard, Report, Rewards
    ├── services/              # storage.js, ai.js, gamification.js, rewards.js, firebase.js
    └── utils/                 # constants.js, mapHelpers.js, imageCompression.js
test/                          # Automated Vitest suites (gamification, storage, mapHelpers, ai)
docs/
└── ARCHITECTURE.md            # Technical specifications, schemas, data flows
assets/                        # Application screenshots and visual assets
```

---

## Limitations & Project Rules

- **Client-Side Storage:** Data is currently persisted in browser `localStorage`. No remote server database is connected. Clearing browser cache resets local reports.
- **No Fabricated Accuracy:** AI classifications are advisory suggestions measured only through human confirmation.
- **Privacy:** Citizen reporter details are kept local and are never transmitted to external LLMs.
- **MVP in development. No model accuracy claimed until measured.**
