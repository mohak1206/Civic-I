# Civic-I: Smart City Reporter (Palghar City)

**Smart City Reporter** is an AI-assisted civic hazard reporting web application designed for the citizens and municipal authorities of **Palghar City, Maharashtra**. It allows residents to photograph, classify, and geolocate urban infrastructure issues—such as potholes, street lights, overflowing garbage, and damaged bridges—while ensuring human-in-the-loop verification, data privacy, and zero simulated backend claims.

---

## Key Features

1. **Photo Capture & Downscaling:** Citizen-facing photo capture with automatic in-browser Canvas compression (< 640px) preventing storage quota exhaustion.
2. **Dual Local Ollama AI:**
   - **Vision Inspection (Gemma 3 4B):** Analyzes photos to suggest issue type with confidence and visual description.
   - **Triage Decision (Llama 3 Text):** Evaluates text facts only to recommend priority (`low` | `medium` | `high`) and routing department. Strictly receives zero personal data and zero images.
3. **Interactive OpenStreetMap with Leaflet:** Powered by Leaflet & `react-leaflet`, featuring draggable pins, GPS auto-centering, Nominatim address search, and custom color-coded category markers.
4. **Resilient Offline / Keyless Architecture:** No Google Maps API key or billing required. If Ollama or a model is unpulled, friendly fallbacks guide the user with exact fix commands (`ollama pull <model>`).
5. **Gamification & Rewards:** Pure functional scoring module (+100 base, +25 location, +15 AI confirmation, +50 resolution), 5 civic progression tiers, 6 badges, and a local leaderboard showing real browser sessions only.
6. **Polished Dark UI:** Mobile-first design with Tailwind CSS, Framer Motion transitions, desktop top navbar, and mobile bottom floating navigation.
7. **Simulation Controls:** Status transitions (reported → in review → in progress → resolved) clearly labeled with `[DEMO]` badges.

---

## Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM (v6), Framer Motion, Lucide React
- **Maps:** Leaflet (`^1.9.4`) and `react-leaflet` (`^4.2.1`) using OpenStreetMap raster tiles
- **Geocoding:** OpenStreetMap Nominatim API (rate-limited to 1 req/sec)
- **Authentication:** Firebase Authentication (Google Sign-In only) with fallback Demo Citizen sign-in
- **Local AI:** Ollama running locally at `http://localhost:11434`
  - Vision: Google Gemma 3 (4B size or larger)
  - Action/Triage: Meta Llama 3 (Text model)
- **Persistence:** Browser `localStorage` via unified abstraction in `src/services/storage.js`
- **Testing:** Vitest and Testing Library

---

## Leaflet & OpenStreetMap Tile Policy

The application uses Leaflet with standard OpenStreetMap tile servers:
- **Attribution:** All maps display: `&copy; OpenStreetMap contributors`.
- **Usage Policy:** In compliance with the [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/), tile requests are made responsibly and geocoding queries via Nominatim are strictly throttled to at most **1 request per second** with identifying user-agent headers. Nominatim is only queried upon explicit user action ("Search" button), never on keystrokes.
- **Production Notice:** Standard OpenStreetMap public tile servers are supported by volunteer donations. For heavy public deployment or high-concurrency production use, please configure a dedicated commercial tile provider or host your own OSM tile server.

---

## Dual Ollama Models Setup

The system integrates two specialized local AI models via Ollama:

1. **Pull the Models:**
   ```bash
   ollama pull gemma3:4b
   ollama pull llama3
   ```
2. **Model Roles & Memory Note:**
   - **Gemma 3 (4B):** Multimodal vision model (requires 4B or larger; 1B size lacks vision understanding). Receives the downscaled image base64 and outputs structured JSON classification.
   - **Llama 3 (8B):** Text-only model. Receives only objective hazard facts (type, description, location) and outputs priority recommendation and department routing.
   - **Memory & Latency:** Running two local models requires sufficient system RAM / VRAM. Ollama loads models sequentially into memory on demand. As a result, the first inference call to each model may take several seconds while the weights are loaded into memory. Subsequent inferences will run much faster.

---

## Environment Variables

Copy `.env.example` to `build/.env`:

```bash
cp .env.example build/.env
```

| Variable | Description | Suggested Value |
| :--- | :--- | :--- |
| `VITE_OLLAMA_VISION_MODEL` | Vision-capable Ollama model for photo inspection | `gemma3:4b` |
| `VITE_OLLAMA_TEXT_MODEL` | Text-only Ollama model for action/urgency decision | `llama3` |
| `OLLAMA_BASE_URL` | Local Ollama endpoint | `http://localhost:11434` |
| `VITE_FIREBASE_API_KEY` | Firebase Auth Web API key | *(leave blank for demo login)* |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | *(leave blank for demo login)* |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | *(leave blank for demo login)* |

---

## Getting Started

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
├── index.html                 # App shell
├── package.json               # Dependencies and build/test scripts
├── vite.config.js             # Vite configuration with /ollama proxy
├── tailwind.config.js         # Tailwind configuration
└── src/
    ├── components/
    │   ├── dashboard/         # StatsGrid, IssueCard, IssueFilters, IssueDetailModal
    │   ├── gamification/      # LevelCard, BadgeList, Leaderboard
    │   ├── layout/            # Navbar, BottomNav, PageContainer
    │   ├── map/               # IssuesDashboardMap, LocationPickerMap, MapFallback, leafletSetup
    │   ├── notifications/     # NotificationCenter popover
    │   ├── report/            # PhotoCapture, AISuggestionBox, AIActionDecisionBox
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
