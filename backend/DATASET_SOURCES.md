# System Architecture & Data Sources

## Overview

The Crop Advisory System is designed to provide farmers in Zimbabwe's Agro-Ecological Region III with contextual, evidence-based agricultural guidance. The system integrates multiple authoritative data sources and uses rule-based algorithms to deliver location-specific, soil-aware, and weather-informed advisory.

## Data Sources

### 1. Agricultural Advisory & Crop Management Data

**Source:** Zimbabwe Agricultural Research Institute (ZARI) and Food and Agriculture Organization (FAO)

**Contents:**
- Crop names and varieties suitable for Region III
- Planting periods and windows
- Crop growth stages with duration
- Recommended activities for each growth stage
- Fertiliser recommendations (type, rate, timing)
- Pest and disease management practices
- Soil requirements
- Water/rainfall requirements
- Source citations and references

**Database Collection:** `AgriculturalKnowledge`

**Example Fields:**
```javascript
{
  cropName: "Maize",
  variety: "SC 513",
  agroEcologicalRegion: "III",
  plantingPeriod: "November - December",
  growthStages: [
    {
      stageName: "Seedling",
      daysAfterPlanting: 14,
      activities: [...]
    }
  ],
  fertiliserRecs: [
    {
      type: "NPK 13:7:6",
      rateKgPerHa: 200,
      timing: "At planting",
      description: "..."
    }
  ],
  source: "Zimbabwe Agricultural Research Institute (ZARI)"
}
```

**Academic Defensibility:** Data is sourced from official agricultural research institutions and FAO publications. All entries include source citations for verification.

---

### 2. Disease & Pest Management Data

**Source:** Zimbabwe Agricultural Research Institute (ZARI), extension publications, verified agricultural databases

**Contents:**
- Disease/pest name
- Affected crops
- Detailed symptoms with distinctiveness weights (for matching algorithm)
- Causative agents (fungal, bacterial, viral, insect)
- Favourable conditions for disease
- Severity ratings
- Preventive measures
- Management/control measures with timing
- Yield loss estimates
- Source citations

**Database Collection:** `DiseaseKnowledge`

**Special Features:**
- Symptoms are stored with **weight values** (1-10) indicating distinctiveness
- Weights are used by the Weighted Symptom Matching Algorithm
- More distinctive symptoms (e.g., "stem borers with frass") receive higher weights
- Common symptoms (e.g., "yellowing") receive lower weights

**Example Fields:**
```javascript
{
  diseaseName: "Maize Lethal Necrosis Virus",
  crop: "Maize",
  symptoms: [
    {
      symptom: "Leaf mottling and necrosis",
      weight: 9,  // High weight - very distinctive
      description: "Green and yellow mottling...",
      affectedParts: ["leaves"]
    },
    {
      symptom: "Yellowing of leaves",
      weight: 7,  // Lower weight - less distinctive
      description: "Progressive yellowing..."
    }
  ],
  managementMeasures: [...],
  source: "ZARI MLN Management Guidelines, 2023"
}
```

**Academic Defensibility:** Data is sourced from official agricultural extension services. All disease entries include management guidance based on verified research.

---

### 3. Soil Data & Soil Management

**Source:** Zimbabwe Agricultural Research Institute (ZARI) Soil Survey and Classification Reports, Region III

**Contents:**
- Soil type (e.g., Sandy loam, Clay loam, Red clay)
- Soil characteristics (texture, structure, color, pH, organic matter)
- Suitable crops for each soil type
- Unsuitable crops
- Drainage characteristics
- Fertility rating and limiting nutrients
- Management practices for each soil type
- Recommended amendments with rates

**Database Collection:** `SoilData`

**Example Fields:**
```javascript
{
  soilType: "Sandy Loam",
  agroEcologicalRegion: "III",
  characteristics: {
    texture: "Sand 60-70%, Silt 15-20%, Clay 10-15%",
    ph: 6.2,
    organicMatter: "Low (1-2%)"
  },
  suitableCrops: ["Maize", "Groundnuts", "Sorghum"],
  fertility: {
    rating: "Low to Medium",
    limitingNutrients: ["Nitrogen", "Phosphorus"]
  },
  managementPractices: [
    {
      practice: "Mulching",
      description: "Apply 5-10cm mulch layer",
      timing: "After planting"
    }
  ],
  amendments: [
    {
      amendment: "Farmyard manure",
      ratePerHa: 10000,
      purpose: "Increase organic matter"
    }
  ]
}
```

**Academic Defensibility:** Data derived from official soil surveys. Soil types and management recommendations reflect verified soil science principles.

---

### 4. Weather & Climate Data

**Source:** NASA POWER (Prediction Of Worldwide Energy Resources) API

**Capabilities:**
- Point-based requests using latitude and longitude
- Historical daily data
- Monthly climatological data
- Hourly data where available
- Parameters: Temperature (T2M), Precipitation (PRECTOT), Relative Humidity (RH2M)
- Geographic coverage: Global, including entire Zimbabwe
- Designed specifically for agricultural applications

**API Details:**
- **Endpoint:** `https://power.larc.nasa.gov/api/v1/timeseries`
- **Method:** GET
- **Parameters:**
  - `lat` (latitude, -22 to -16 for Zimbabwe)
  - `lon` (longitude, 25 to 33 for Zimbabwe)
  - `start` (YYYYMMDD format)
  - `end` (YYYYMMDD format)
  - `parameters` (T2M, PRECTOT, RH2M)

**Validation:** System validates that farmer location is within Zimbabwe boundaries before requesting data:
- Latitude: -22.4°S to -15.5°S
- Longitude: 25.2°E to 33.1°E

**Usage in System:**
- NOT for weather prediction (system does not predict weather)
- Weather data is retrieved and used as input to advisory rules
- Recent weather data (last 7 days) is retrieved when generating contextual advisories
- Climatological data provides regional patterns for advisory rules

**Example Usage:**
```javascript
// Request weather data for farmer's location
const startDate = '20230815';  // 15 August 2023
const endDate = '20230822';    // 22 August 2023
const latitude = -18.2;        // Kadoma region
const longitude = 29.7;

// API returns daily temperature, precipitation, humidity for those dates
// System uses this to determine if advisory timing needs adjustment
// Example: "Heavy rainfall detected - delay fertiliser application"
```

**Academic Defensibility:** 
- NASA POWER is an internationally recognized and peer-reviewed data source
- Provides real environmental data, not predictions
- System documentation explicitly states data source
- Transparently used as input to decision rules, not as ML model

---

## Data Flow Architecture

```
┌──────────────────┐
│      FARMER      │
│   (Profile:      │
│   Crop, Location,│
│   Soil Type)     │
└────────┬─────────┘
         │
         ├─────────────────────────────────────────────┐
         │                                             │
         v                                             v
  ┌──────────────────┐                        ┌──────────────────┐
  │  Agricultural    │                        │  Farmer Location  │
  │  Knowledge DB    │                        │  (GPS Coords)     │
  └────────┬─────────┘                        └────────┬──────────┘
           │                                           │
           │         ┌─────────────────────────────────┘
           │         │
           v         v
       ┌──────────────────────┐
       │  Rule-Based Advisory │
       │  Decision Engine     │
       │                      │
       │  Input:              │
       │  - Crop              │
       │  - Growth stage      │
       │  - Soil type         │
       │  - Weather/climate   │
       │                      │
       │  Output:             │
       │  Contextual advisories│
       │  with reasoning      │
       └────────┬─────────────┘
                │
                v
        ┌──────────────────┐
        │  Farmer Receives │
        │  Personalized    │
        │  Advisory        │
        └──────────────────┘
```

**Disease Identification Flow:**

```
┌────────────────────────┐
│  Farmer Describes      │
│  Symptoms              │
└────────┬───────────────┘
         │
         v
  ┌──────────────────┐
  │  Symptom List    │
  │  (array)         │
  └────────┬─────────┘
           │
           v
  ┌──────────────────────────────────┐
  │  Weighted Symptom Matcher        │
  │                                  │
  │  Algorithm:                      │
  │  For each disease:               │
  │   Calculate match score using    │
  │   weighted symptom matching      │
  │                                  │
  │  Formula:                        │
  │  Score = Σ(weight of matched)   │
  │          ÷ Σ(weight of all) × 100│
  └────────┬─────────────────────────┘
           │
           v
  ┌────────────────────────┐
  │  Disease Knowledge DB  │
  │  (symptoms + weights)  │
  └────────────────────────┘
           │
           v
  ┌──────────────────────────┐
  │  Ranked Results          │
  │  1. Disease A - 85%      │
  │  2. Disease B - 60%      │
  │  3. Disease C - 45%      │
  └──────────────────────────┘
           │
           v
  ┌──────────────────────────┐
  │  Farmer Receives         │
  │  Most Likely Disease     │
  │  + Match Score           │
  │  + Management Measures   │
  └──────────────────────────┘
```

---

## Data Collection & Maintenance

### Knowledge Base Seeding

Initial population of MongoDB is performed via seeding scripts:

1. **`scripts/seed-agricultural-knowledge.js`**
   - Populates AgriculturalKnowledge collection
   - Includes maize, groundnuts, sorghum for Region III
   - Includes growth stages, activities, fertiliser recommendations

2. **`scripts/seed-disease-knowledge.js`**
   - Populates DiseaseKnowledge collection
   - Includes major diseases affecting Region III crops
   - Includes weighted symptoms, management measures

3. **`scripts/seed-soil-data.js`**
   - Populates SoilData collection
   - Includes soil types common in Region III
   - Includes management practices and amendments

**To seed initial data:**
```bash
cd backend
npm install
node scripts/seed-agricultural-knowledge.js
node scripts/seed-disease-knowledge.js
node scripts/seed-soil-data.js
```

### Weather Data Collection

Weather data is NOT stored permanently. Instead:
- System retrieves recent weather from NASA POWER when needed
- Weather is cached only temporarily during advisory generation
- No weather_data collection needed

### Ongoing Maintenance

- Agricultural knowledge should be updated annually as new research becomes available
- Disease information should be updated as new outbreaks occur
- Soil data is relatively static but should be verified annually
- Admin interface allows adding/updating knowledge entries

---

## Academic Integrity & Defensibility

### Dataset Sources Statement

**For your supervisor:**

> "The advisory and disease information used by the system was derived from verified agricultural information sources, specifically the Zimbabwe Agricultural Research Institute (ZARI) and Food and Agriculture Organization (FAO) guidelines. These sources contain documented information on crops, diseases, symptoms, management practices, and climatic conditions relevant to Agro-Ecological Region III of Zimbabwe. Weather and climate data is obtained from NASA POWER through its API, which provides location-based meteorological data using latitude/longitude coordinates, specifically designed for agricultural applications. The system uses this authoritative data as input to decision rules rather than attempting to predict environmental conditions."

### Data Quality Assurance

1. **Source Citations:** Every data entry includes source attribution
2. **Geographic Specificity:** All data is regionalized (Region III focus)
3. **Timestamp Tracking:** Creation and update dates are recorded
4. **Versioning:** Multiple seed scripts allow data versioning
5. **Validation:** System validates farmer location against Zimbabwe boundaries

---

## API Endpoints for Data Access

### Agricultural Knowledge
- `GET /api/knowledge/agricultural` - List all agricultural knowledge
- `GET /api/knowledge/agricultural?crop=Maize` - Filter by crop
- `GET /api/knowledge/agricultural/:id` - Get detailed crop information

### Disease Knowledge
- `GET /api/knowledge/diseases` - List all diseases
- `GET /api/knowledge/diseases?crop=Maize` - Filter by crop
- `POST /api/diseases-symptom-match` - Match symptoms to diseases (algorithm endpoint)

### Soil Data
- `GET /api/knowledge/soil` - List all soil types
- `GET /api/knowledge/soil?soilType=Sandy` - Filter by soil type
- `GET /api/knowledge/soil/:id` - Get detailed soil information

### Contextual Advisories
- `GET /api/advisories-contextual/farmer` - Get personalized advisories for logged-in farmer
- `GET /api/advisories-contextual/weather/:farmerId` - Get weather data for farmer's location

---

## Transparency & Reproducibility

All data sources, algorithms, and decision rules are documented and traceable:

1. **Seeding scripts** contain exact data used to initialize system
2. **Algorithm implementations** are publicly documented in backend code
3. **API endpoints** clearly specify which data source and algorithm is used
4. **Source attribution** is included in every database record
5. **Decision reasoning** is returned to farmer (e.g., "This advisory because rainfall detected at your location")

This transparency ensures the system is defensible for academic review.
