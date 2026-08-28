// ─── Crop Advisory Static / Seed Data ─────────────────────────────────────────

export const CROPS = [
  { id: 'maize',       name: 'Maize',        emoji: '🌽' },
  { id: 'sorghum',     name: 'Sorghum',      emoji: '🌾' },
  { id: 'pearlmillet', name: 'Pearl Millet', emoji: '🌾' },
  { id: 'cowpeas',     name: 'Cowpeas',      emoji: '🫘' },
  { id: 'groundnuts',  name: 'Groundnuts',   emoji: '🥜' },
  { id: 'sunflower',   name: 'Sunflower',    emoji: '🌻' },
  { id: 'cotton',      name: 'Cotton',       emoji: '🌿' },
];

export const SOIL_TYPES = [
  { id: 'sandy_loam', name: 'Sandy Loam' },
  { id: 'clay_loam',  name: 'Clay Loam'  },
  { id: 'red_clay',   name: 'Red Clay'   },
];

export const SYMPTOMS = {
  maize: [
    'Yellow leaves', 'Yellow streaks on leaves', 'Brown spots',
    'Leaf streaks', 'Rust pustules', 'Stunted growth',
    'Wilting', 'Leaf blight', 'Discolouration', 'Grey lesions',
  ],
  tomato: [
    'Water-soaked spots', 'Brown spots with rings', 'White mould',
    'Wilting', 'Stem lesions', 'Rapid plant death', 'Yellow leaves',
  ],
  beans: [
    'Angular brown spots', 'Spots limited by veins', 'Rust pustules',
    'Yellow leaves', 'Leaf drop', 'Brown lesions',
  ],
};

export const DISEASES = {
  maize: [
    {
      id: 'msv',
      name: 'Maize Streak Virus',
      severity: 'High',
      symptoms: ['Yellow leaves', 'Yellow streaks on leaves', 'Leaf streaks', 'Stunted growth'],
      description: 'A viral disease transmitted by leafhoppers (Cicadulina species). Causes severe yield losses, especially when infection occurs at seedling stage.',
      causes: 'Caused by Maize Streak Virus, spread by leafhopper insects feeding on infected plants.',
      management: 'No chemical cure. Remove and destroy infected plants. Control leafhopper vectors with registered insecticides.',
      prevention: 'Plant early. Use resistant varieties (SC403, ZM309). Inspect from emergence. Remove infected plants promptly.',
      source: 'Agritex Zimbabwe / CIMMYT Maize Disease Guide',
    },
    {
      id: 'gls',
      name: 'Grey Leaf Spot',
      severity: 'High',
      symptoms: ['Grey lesions', 'Yellow leaves', 'Leaf blight', 'Brown spots'],
      description: 'Fungal disease caused by Cercospora zeae-maydis. Rectangular grey lesions reduce photosynthesis.',
      causes: 'Fungal spores spread by wind and rain. Favoured by high humidity and warm temperatures.',
      management: 'Apply azoxystrobin or propiconazole fungicide at first signs. Remove infected debris.',
      prevention: 'Use resistant varieties. Crop rotation. Avoid dense planting.',
      source: 'FAO / Agritex Zimbabwe',
    },
    {
      id: 'nclb',
      name: 'N. Corn Leaf Blight',
      severity: 'Medium',
      symptoms: ['Brown spots', 'Stunted growth', 'Leaf blight'],
      description: 'Fungal disease causing cigar-shaped lesions that turn brown and lead to leaf dieback.',
      causes: 'Setosphaeria turcica fungus. Spread by wind and rain in cool, moist conditions.',
      management: 'Apply propiconazole or mancozeb fungicide early. Remove infected leaves.',
      prevention: 'Rotate crops. Use resistant hybrids. Avoid overhead irrigation.',
      source: 'FAO',
    },
  ],
};

export const SEASON_STAGES = [
  { id: 'land_prep',  name: 'Land Preparation',   period: 'Oct – Early Nov 2024', status: 'done',     emoji: '🏗️' },
  { id: 'planting',   name: 'Planting',             period: 'Mid Nov – Mid Dec',   status: 'current',  emoji: '🌱' },
  { id: 'basal',      name: 'Basal Fertiliser',     period: 'At planting',         status: 'upcoming', emoji: '💊' },
  { id: 'weeding1',   name: 'First Weeding',        period: '2–3 weeks after',     status: 'upcoming', emoji: '🌿' },
  { id: 'topdress',   name: 'Top Dressing',         period: '4–6 weeks after',     status: 'upcoming', emoji: '💊' },
  { id: 'pest',       name: 'Pest & Disease Check', period: 'Throughout season',   status: 'upcoming', emoji: '🔍' },
  { id: 'harvest',    name: 'Harvesting',           period: 'Mar – Apr 2025',      status: 'upcoming', emoji: '🌾' },
];

export const ACTIVITY_DETAIL = {
  planting: {
    title: 'Planting',
    crop: 'Maize',
    period: 'Mid Nov – Mid Dec 2024',
    status: 'current',
    what: 'Plant maize 5 cm deep, 25 cm apart in rows 90 cm apart. Use certified seed. Apply Compound D (7:14:7) at 200 kg/ha at planting as basal fertiliser. Plant at the onset of effective rainfall — at least 25mm over 3 days.',
    soil: 'Sandy loam is well drained but retains less moisture. Plant as soon as effective rains begin and do not delay — early planting maximises use of available rainfall in Region III.',
    weather: 'Open-Meteo is forecasting 28mm of rainfall over the next 3 days for your location. This is sufficient effective rainfall to begin planting. Plant within the next 2–3 days.',
    why: 'Your crop is Maize, your farm is in Region III (Kadoma), on Sandy Loam soil. The current date falls within the recommended planting window. Open-Meteo data shows effective rainfall is imminent. All conditions align.',
    source: 'FAO / Agritex Zimbabwe Maize Production Guide 2023 · Region III',
  },
};

export const KNOWLEDGE_ARTICLES = [
  { id: 'k1', crop: 'Maize', category: 'Farming Guide',    title: 'Production guide for AER III',                 preview: 'Planting windows, soil prep, variety selection for Region III conditions…' },
  { id: 'k2', crop: 'Maize', category: 'Pest Management',  title: 'Fall Armyworm identification & control',        preview: 'Recognise FAW damage early. Inspect whorls for frass and feeding…' },
  { id: 'k3', crop: 'Maize', category: 'Fertiliser',       title: 'Fertiliser recommendations',                    preview: 'Compound D at planting, AN at V5-V6. Rates for sandy loam soils…' },
  { id: 'k4', crop: 'General', category: 'Soil Management', title: 'Soil fertility management for Region III',     preview: 'Sandy loam, clay loam and red clay management practices…' },
  { id: 'k5', crop: 'General', category: 'Pest Management', title: 'Integrated pest management',                   preview: 'Prevention, monitoring, threshold-based treatment strategies…' },
  { id: 'k6', crop: 'Maize', category: 'Disease Prevention', title: 'Common maize diseases and management',        preview: 'Grey Leaf Spot, Maize Streak Virus, Northern Corn Leaf Blight…' },
];

export const KNOWLEDGE_CATS = [
  { id: 'maize',    name: 'Maize',       emoji: '🌽', count: 12 },
  { id: 'sorghum',  name: 'Sorghum',     emoji: '🌾', count: 8  },
  { id: 'gnuts',    name: 'Groundnuts',  emoji: '🥜', count: 6  },
  { id: 'soil',     name: 'Soil Mgmt',   emoji: '🌱', count: 5  },
  { id: 'pest',     name: 'Pest Mgmt',   emoji: '🦗', count: 9  },
  { id: 'disease',  name: 'Disease Prev',emoji: '🛡️', count: 7  },
];

export const NOTIFICATIONS = [
  { id: 'n1', type: 'weather', icon: '🌧', title: 'Rain expected — planting window', body: 'Effective rainfall forecast for Kadoma this weekend. Check your current recommendation.',  time: '2 hours ago' },
  { id: 'n2', type: 'crop',    icon: '🌱', title: 'Planting window opening',          body: 'Your maize seasonal plan indicates planting should begin in the next 5 days.',            time: 'Yesterday'    },
  { id: 'n3', type: 'alert',   icon: '⚠️', title: 'Fall Armyworm alert — Midlands',  body: 'FAW reported nearby. Inspect maize whorls for frass and feeding damage.',               time: '2 days ago'   },
  { id: 'n4', type: 'crop',    icon: '💊', title: 'Basal fertiliser reminder',        body: 'Apply Compound D at planting. Plan recommends 200 kg/ha for Sandy Loam.',               time: '3 days ago'   },
];

export const RECORD_CATEGORIES = [
  { id: 'planting',   label: 'Planting',   emoji: '🌱', color: '#4ade80' },
  { id: 'fertiliser', label: 'Fertiliser', emoji: '💊', color: '#38bdf8' },
  { id: 'pesticide',  label: 'Pesticide',  emoji: '🧪', color: '#fbbf24' },
  { id: 'harvest',    label: 'Harvest',    emoji: '🌾', color: '#c8a96e' },
  { id: 'expense',    label: 'Expense',    emoji: '💰', color: '#f87171' },
];

export const SAMPLE_RECORDS = [
  { id: 'r1', category: 'planting',   name: 'Planting — Maize',  meta: 'SC403 · 2 ha',               date: '24 Nov' },
  { id: 'r2', category: 'fertiliser', name: 'Basal Fertiliser',  meta: 'Compound D · 200 kg/ha',     date: '24 Nov' },
  { id: 'r3', category: 'pesticide',  name: 'FAW Spray',         meta: 'Emamectin benzoate',          date: '10 Dec' },
  { id: 'r4', category: 'harvest',    name: 'First Weeding',     meta: 'Hand weeding · 2 ha',        date: '08 Dec' },
];
