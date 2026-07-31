# 🌽 Seasonal Crop Advisory System
### Zimbabwe Agro-Ecological Region III

A full-stack mobile agricultural support platform for small-scale farmers.

---

## Project Structure

```
crop-advisory/
├── backend/                   ← Node.js + Express + MongoDB API
│   ├── models/                ← Mongoose schemas
│   │   ├── User.js
│   │   ├── Advisory.js
│   │   ├── Disease.js
│   │   ├── Record.js
│   │   ├── Notification.js
│   │   └── Knowledge.js
│   ├── controllers/           ← Business logic
│   │   ├── authController.js
│   │   ├── advisoryController.js
│   │   ├── diseaseController.js
│   │   ├── recordController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── routes/                ← Express route definitions
│   │   ├── auth.js
│   │   ├── advisories.js
│   │   ├── diseases.js
│   │   ├── records.js
│   │   ├── notifications.js
│   │   ├── reports.js
│   │   ├── users.js
│   │   └── knowledge.js
│   ├── middleware/
│   │   └── auth.js            ← JWT protect + role authorize
│   ├── server.js              ← Express app + cron jobs
│   ├── seed.js                ← Database seeder
│   ├── .env.example
│   └── package.json
│
├── mobile-app/                ← React Native (Expo) — Farmer App
│   ├── src/
│   │   ├── api.js             ← Axios API client
│   │   ├── context/
│   │   │   └── AuthContext.js ← Authentication state
│   │   └── screens/
│   │       └── Screens.js     ← Login, Register, Dashboard, Disease ID
│   ├── App.js                 ← Navigation setup
│   └── package.json
│
└── frontend-web/              ← React.js — Unified web app
    ├── src/
    │   ├── components/
    │   └── pages/
    └── package.json
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install

# Copy and fill in your environment variables
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, Firebase credentials

# Seed the database (creates admin + test farmer + sample data)
npm run seed

# Start the server
npm run dev        # development (nodemon)
npm start          # production
```

**Default seed credentials:**
- Admin:  `admin@cropadvisory.zw` / `Admin@1234`
- Farmer: `farmer@test.zw` / `Farmer@1234`

---

### 2. Mobile App (React Native / Expo)

```bash
cd mobile-app
npm install

# Update the API base URL in src/api.js:
# const BASE_URL = 'http://YOUR_SERVER_IP:5000/api';

npx expo start
# Scan QR code with Expo Go app on your phone
```

---

### 3. Web Dashboard (React)

```bash
cd frontend-web
npm install
npm start
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new farmer |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Advisories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/advisories` | List all advisories |
| GET | `/api/advisories?upcoming=true` | Upcoming advisories |
| GET | `/api/advisories?crop=Maize` | Filter by crop |
| POST | `/api/advisories` | Create advisory (admin) |
| PUT | `/api/advisories/:id` | Update advisory (admin) |
| DELETE | `/api/advisories/:id` | Delete advisory (admin) |

### Disease Identification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diseases` | List all diseases |
| GET | `/api/diseases?crop=Maize` | Filter by crop |
| POST | `/api/diseases/identify` | **Identify disease by symptoms** |
| POST | `/api/diseases` | Add disease (admin) |
| PUT | `/api/diseases/:id` | Update disease (admin) |
| DELETE | `/api/diseases/:id` | Delete disease (admin) |

**Disease Identification Request:**
```json
POST /api/diseases/identify
{
  "crop": "Maize",
  "symptoms": ["Yellow leaves", "Stunted growth", "Yellow streaks on leaves"]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "disease": { "diseaseName": "Maize Streak Virus", "treatment": "...", "prevention": "..." },
      "matchScore": 75,
      "matchedSymptoms": 2
    }
  ]
}
```

### Farm Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records` | Get my records |
| GET | `/api/records?category=Planting` | Filter by category |
| GET | `/api/records?search=maize` | Search records |
| GET | `/api/records/summary` | Get summary stats |
| POST | `/api/records` | Add record |
| PUT | `/api/records/:id` | Update record |
| DELETE | `/api/records/:id` | Delete record |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| POST | `/api/notifications` | Send notification (admin) |
| DELETE | `/api/notifications/:id` | Delete notification (admin) |

---

## Deployment

### Backend (Render / Railway)

1. Push code to GitHub
2. Connect repo to Render.com
3. Set environment variables in Render dashboard
4. Deploy as a Web Service

### MongoDB (Atlas)
1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP (0.0.0.0/0 for hosted apps)
4. Copy connection string to `.env`

### Firebase (Push Notifications)
1. Create project at console.firebase.google.com
2. Enable Cloud Messaging
3. Download service account JSON
4. Copy credentials to `.env`

---

## Technologies

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo) |
| Admin Web | React.js |
| Backend API | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Push Notifications | Firebase Cloud Messaging |
| Scheduled Jobs | node-cron |
| Hosting | Render / Railway / VPS |
