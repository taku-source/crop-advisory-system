// Web Admin Design Tokens — matches HTML design exactly
export const theme = {
  colors: {
    bg:        '#f6f8f6',
    surface:   '#ffffff',
    border:    '#e2ebe2',
    green:     '#166534',
    greenLt:   '#dcfce7',
    greenMid:  '#16a34a',
    text:      '#1a2e1a',
    grey:      '#4a6a4a',
    greyLt:    '#888888',
    danger:    '#991b1b',
    dangerLt:  '#fee2e2',
    warn:      '#854d0e',
    warnLt:    '#fef9c3',
    blue:      '#1e40af',
    blueLt:    '#dbeafe',
    neutral:   '#6b7280',
    neutralLt: '#f3f4f6',
  },
};

export const ADMIN_NAV = [
  { id: 'dashboard',  icon: '📊', label: 'Dashboard',        group: 'System'     },
  { id: 'farmers',    icon: '👨‍🌾', label: 'Farmers',          group: 'System'     },
  { id: 'knowledge',  icon: '📖', label: 'Ag. Knowledge',    group: 'Knowledge'  },
  { id: 'diseases',   icon: '🦠', label: 'Disease DB',       group: 'Knowledge'  },
  { id: 'soil',       icon: '🌱', label: 'Soil Data',        group: 'Knowledge'  },
  { id: 'rules',      icon: '⚙️', label: 'Advisory Rules',   group: 'Knowledge'  },
  { id: 'notifs',     icon: '🔔', label: 'Notifications',    group: 'Management' },
  { id: 'reports',    icon: '📈', label: 'Reports',          group: 'Management' },
];

export const CROPS = [
  { id: 'maize',       name: 'Maize',        emoji: '🌽' },
  { id: 'sorghum',     name: 'Sorghum',      emoji: '🌾' },
  { id: 'pearlmillet', name: 'Pearl Millet', emoji: '🌾' },
  { id: 'cowpeas',     name: 'Cowpeas',      emoji: '🫘' },
  { id: 'groundnuts',  name: 'Groundnuts',   emoji: '🥜' },
  { id: 'sunflower',   name: 'Sunflower',    emoji: '🌻' },
  { id: 'cotton',      name: 'Cotton',       emoji: '🌿' },
];

export const MOCK_FARMERS = [
  { id:'1', fullName:'John Moyo',     email:'john@farm.zw',   phone:'0771 234 567', district:'Kadoma',     ward:'Ward 5', crop:'🌽 Maize',     soil:'Sandy Loam', stage:'Planting',  status:'Active',   joined:'15 Jan 2024' },
  { id:'2', fullName:'Grace Ndlovu',  email:'grace@farm.zw',  phone:'0772 345 678', district:'Gweru',      ward:'Ward 3', crop:'🌾 Sorghum',   soil:'Clay Loam',  stage:'Land Prep', status:'Active',   joined:'20 Feb 2024' },
  { id:'3', fullName:'Peter Chikosi', email:'peter@farm.zw',  phone:'0773 456 789', district:'Kwekwe',     ward:'Ward 8', crop:'🌽 Maize',     soil:'Sandy Loam', stage:'Planting',  status:'Active',   joined:'10 Mar 2024' },
  { id:'4', fullName:'Mary Sibanda',  email:'mary@farm.zw',   phone:'0774 567 890', district:'Shurugwi',   ward:'Ward 2', crop:'🥜 Groundnuts',soil:'Red Clay',   stage:'—',         status:'Inactive', joined:'05 Apr 2024' },
  { id:'5', fullName:'Tendai Mhike',  email:'tendai@farm.zw', phone:'0775 678 901', district:'Kadoma',     ward:'Ward 7', crop:'🌽 Maize',     soil:'Sandy Loam', stage:'Planting',  status:'Active',   joined:'18 May 2024' },
];

export const MOCK_DISEASES = [
  { id:'d1', crop:'Maize',  name:'Maize Streak Virus',     severity:'High',   symptoms:'Yellow streaks, Stunted growth, Small plant',   management:'No cure. Remove infected plants.',         source:'Agritex ZW' },
  { id:'d2', crop:'Maize',  name:'Grey Leaf Spot',         severity:'High',   symptoms:'Grey lesions, Yellow halo, Leaf blight',         management:'Apply azoxystrobin fungicide.',             source:'FAO' },
  { id:'d3', crop:'Maize',  name:'N. Corn Leaf Blight',    severity:'Medium', symptoms:'Cigar-shaped lesions, Leaf dieback',             management:'Apply propiconazole. Crop rotation.',      source:'FAO' },
  { id:'d4', crop:'Tomato', name:'Late Blight',            severity:'High',   symptoms:'Water-soaked spots, White mould',                management:'Apply metalaxyl or copper fungicides.',    source:'FAO' },
  { id:'d5', crop:'Tomato', name:'Bacterial Wilt',         severity:'High',   symptoms:'Sudden wilting, Brown stem inside',              management:'Remove infected plants. Improve drainage.',source:'Agritex ZW' },
  { id:'d6', crop:'Beans',  name:'Angular Leaf Spot',      severity:'Medium', symptoms:'Angular brown spots, Defoliation',               management:'Copper-based fungicides. Certified seed.', source:'Agritex ZW' },
];

export const MOCK_RULES = [
  { id:'r1', crop:'Maize', region:'III', stage:'Planting',   type:'Advisory', title:'Prepare field — effective rainfall detected',   condition:'Crop = Maize · Region = III · Stage = Pre-planting · Date = Nov–Dec · Rainfall ≥ 25mm/7d · Soil = Sandy Loam OR Clay Loam', recommendation:'🌱 Prepare your field for planting. Plant maize after the next effective rainfall (25mm+) within the planting window.', reason:'Seasonal date, crop type, soil, and weather data match the recommended planting window for maize in Region III.' },
  { id:'r2', crop:'Maize', region:'III', stage:'Vegetative', type:'Advisory', title:'Apply top dressing fertiliser — V5-V6 stage',    condition:'Crop = Maize · Stage = V5–V6 (4–6 weeks after planting) · Crop progress: Top Dressing not yet completed', recommendation:'💊 Apply Ammonium Nitrate at 200 kg/ha. Maize is at V5-V6 — the optimal time for top dressing.', reason:'Maize nitrogen demand is highest during rapid vegetative growth. Late application significantly reduces yield.' },
  { id:'r3', crop:'All',   region:'III', stage:'Vegetative', type:'Alert',    title:'Fall Armyworm — monitor and treat if threshold exceeded', condition:'Crop = Maize · Stage = Vegetative · Month = Dec–Jan · FAW reports in district OR surrounding region', recommendation:'🦗 Inspect maize whorls for Fall Armyworm. Treat if >20% of plants are infested.', reason:'FAW is a major yield threat in Region III during vegetative stage. Early detection prevents crop losses.' },
];

export const MOCK_NOTIFICATIONS = [
  { id:'n1', title:'Planting window now open — Midlands Region', message:'Effective rainfall recorded. Farmers with maize should begin preparation.', type:'Advisory',      target:'All farmers',    sent:'Today 07:15',   delivered:198 },
  { id:'n2', title:'Fall Armyworm alert — Midlands',             message:'FAW reported in nearby districts. Inspect maize whorls.',              type:'Disease Alert', target:'Maize farmers',  sent:'2 days ago',    delivered:142 },
  { id:'n3', title:'Top dressing reminder — maize V5',           message:'Your maize is approaching top dressing stage.',                        type:'Reminder',      target:'Stage: Veget.',  sent:'5 days ago',    delivered:86  },
];

export const SOIL_DATA = [
  { id:'s1', name:'Sandy Loam', icon:'🟤', color:'#92400e', tags:['Region III','Most common'], drainage:'Good — well drained', fertility:'Low to medium', crops:'Maize, Sorghum, Groundnuts, Cowpeas', body:'Well-drained, medium fertility. Suitable for maize, sorghum, groundnuts. Drought-prone; plant early to maximise rainfall use.' },
  { id:'s2', name:'Clay Loam',  icon:'🔵', color:'#1e40af', tags:['Region III'],              drainage:'Moderate',           fertility:'Medium to high', crops:'Maize, Cotton',                       body:'Higher water retention, heavier texture. Suitable for maize and cotton. Risk of waterlogging in heavy rainfall years.' },
  { id:'s3', name:'Red Clay',   icon:'🔴', color:'#991b1b', tags:['Region III'],              drainage:'Slow',               fertility:'High potential',  crops:'Maize, Cotton, Cowpeas',               body:'High clay content, high fertility potential. Suitable for maize, cotton, cowpeas. Slow drainage; careful tillage needed.' },
];
