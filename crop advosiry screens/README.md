# Crop Advisory — Full Frontend Implementation
### Seasonal Crop Advisory System · Zimbabwe Agro-Ecological Region III

Complete React Native (Expo) mobile app + React.js (Vite) admin web dashboard.
Design matches the approved HTML design exactly.

---

## Project Structure

```
crop-advisory-app/
├── mobile/                        ← React Native + Expo (Farmer App)
│   ├── App.js                     ← Root + navigation
│   ├── app.json                   ← Expo config
│   ├── package.json
│   └── src/
│       ├── constants/
│       │   ├── theme.js           ← Design tokens (colors, fonts, spacing)
│       │   └── data.js            ← Static data, crops, diseases, stages
│       ├── context/
│       │   └── AuthContext.js     ← Auth state + AsyncStorage persistence
│       ├── components/
│       │   ├── UI.js              ← Shared UI components
│       │   └── BottomNav.js       ← Bottom tab navigation
│       └── screens/
│           ├── LoginScreen.js
│           ├── RegisterScreen.js
│           ├── CropSelectScreen.js
│           ├── HomeScreen.js      ← Advisory engine output screen
│           ├── SeasonDiseaseScreens.js  ← Season plan + Disease ID + Detail
│           ├── RecordsScreen.js   ← Farm records + Add record modal
│           └── OtherScreens.js    ← Knowledge + Notifications + Profile
│
└── web/                           ← React.js + Vite (Admin Dashboard)
    ├── package.json
    ├── vite.config.js
    ├── public/index.html
    └── src/
        ├── App.jsx                ← Root with auth + page routing
        ├── constants/data.js      ← Admin mock data + static data
        ├── components/
        │   ├── UI.jsx             ← Table, Modal, Button, Pill, Toast, etc.
        │   ├── Sidebar.jsx        ← Navigation sidebar
        │   └── AdminLayout.jsx    ← Page shell wrapper
        └── pages/
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            ├── FarmersPage.jsx
            ├── KnowledgePages.jsx ← Agricultural Knowledge + Disease DB + Soil
            └── ManagementPages.jsx← Advisory Rules + Notifications + Reports
```

---

## Quick Start

### Mobile App (React Native + Expo)

```bash
cd mobile
npm install
npx expo start

# Scan QR code with Expo Go app on your phone
# Or press 'a' for Android emulator, 'i' for iOS simulator
```

**Demo login:** any email + any password (uses mock data)

### Admin Dashboard (React.js + Vite)

```bash
cd web
npm install
npm run dev

# Opens at http://localhost:3000
```

**Admin login:**
- Email: `admin@cropadvisory.zw`
- Password: `Admin@1234`

---

## Mobile Screens

| Screen | Description |
|--------|-------------|
| Login | Email/password auth with animated background |
| Register | Full farmer registration with GPS location permission |
| Crop Select | Multi-select from 7 crops (Maize, Sorghum, Pearl Millet, Cowpeas, Groundnuts, Sunflower, Cotton) |
| **Home** | **Advisory engine output — "What to do now" + weather + up next** |
| Season Plan | Full seasonal timeline with stage progress tracker |
| Activity Detail | Instructions + soil/weather context + "Why?" explanation + Mark Complete |
| Disease ID | Symptom picker → weighted matcher → ranked results |
| Disease Detail | Full match score, management, prevention, sources |
| Farm Records | Summary stats + categorised list + Add Record modal |
| Knowledge | Category grid + article browser with search |
| Notifications | Push notification history with type icons |
| Profile | Farm details editor + crop list + settings |

---

## Admin Screens

| Screen | Description |
|--------|-------------|
| Login | Clean admin authentication |
| Dashboard | System overview + recent farmer activity + engine status |
| Farmers | Full farmer list + detail panel with engine recommendation |
| Ag. Knowledge | Per-crop knowledge editor with growth stages |
| Disease DB | Full CRUD for disease records with symptom weights |
| Soil Data | Soil type cards + edit form |
| **Advisory Rules** | **IF/THEN rule editor for the rule-based engine** |
| Notifications | Compose with push preview + target audience + sent history |
| Reports | Charts: farmers by crop/district, disease queries, soil types |

---

## Design System

### Colors (Mobile — dark theme)
| Token | Value | Use |
|-------|-------|-----|
| `leaf` | `#4ade80` | Primary accent |
| `leafDim` | `#163322` | Green tinted backgrounds |
| `sky` | `#38bdf8` | Weather / Open-Meteo data |
| `soil` | `#c8a96e` | Secondary accent |
| `danger` | `#f87171` | High severity / errors |
| `warn` | `#fbbf24` | Medium severity / warnings |

### Colors (Web Admin — light theme)
| Token | Value | Use |
|-------|-------|-----|
| `green` | `#166534` | Primary |
| `greenLt` | `#dcfce7` | Backgrounds / active states |
| `border` | `#e2ebe2` | All borders |
| `text` | `#1a2e1a` | Body text |

### Typography
- **Syne 800** — Display headings
- **Inter** — Body text (400/500/600/700)
- **JetBrains Mono** — Labels, codes, dates, metadata

---

## Architecture Reflected in UI

```
Agricultural Knowledge DB  ─┐
Soil Knowledge DB           ├─► Advisory Rule Engine ──► HOME: "What to do now"
Disease Knowledge DB        │           │
                            │           │
Farmer Profile              ├───────────┤
(crop, soil, GPS, stage)    │           │
                            │           │
Open-Meteo (7-day forecast) ├───────────┤
NASA POWER (climate data)   ─┘           │
                                         ▼
                              CONTEXTUAL RECOMMENDATION
                              displayed on Home screen

Farmer symptoms ──► Weighted Symptom Matcher ──► Ranked Disease Results
```

- **Home screen** = Advisory engine output
- **Admin Rules screen** = The IF/THEN logic the engine uses
- **Disease ID** = Weighted symptom matching (not image AI)
- **Records** = Separate from the recommendation engine
- **Knowledge** = Browsable supplement to the advisory
- **Why box** on every recommendation = Engine contextualisation

---

## Connecting to a Backend API

Replace mock data calls with real API calls in:

**Mobile** — `src/context/AuthContext.js`
```js
// Replace mock login with:
const res = await fetch('http://YOUR_SERVER/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
```

**Web** — each page file, replace `useState(MOCK_DATA)` with:
```js
useEffect(() => {
  fetch('/api/farmers', { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.json())
    .then(d => setFarmers(d.farmers));
}, []);
```

---

## Dependencies

### Mobile
- `expo` ~50.0.0
- `@react-navigation/native` + `native-stack`
- `expo-linear-gradient`
- `expo-location`
- `expo-notifications`
- `@react-native-async-storage/async-storage`
- `react-native-safe-area-context`
- Google Fonts: Syne, Inter, JetBrains Mono

### Web
- `react` ^18.2.0
- `vite` ^5.0.8
- `@vitejs/plugin-react`
- Google Fonts via CDN (no npm package needed)
