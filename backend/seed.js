/**
 * Seed script — run once to populate the database with initial data:
 *   node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Disease  = require('./models/Disease');
const Advisory = require('./models/Advisory');
const Knowledge = require('./models/Knowledge');

const DISEASES = [
  // ── Maize ──────────────────────────────────────────────────────────────────
  { crop: 'Maize', diseaseName: 'Grey Leaf Spot', severity: 'High', symptoms: ['Grey rectangular spots on leaves', 'Yellow halo around spots', 'Leaf blight', 'Premature leaf death'], description: 'A fungal disease caused by Cercospora zeae-maydis, common during wet seasons.', causes: 'Fungal infection spread by wind and rain, favoured by high humidity and warm temperatures.', prevention: 'Use resistant varieties; practice crop rotation; avoid dense planting; remove crop debris after harvest.', treatment: 'Apply fungicides containing azoxystrobin or propiconazole at first sign of infection.' },
  { crop: 'Maize', diseaseName: 'Maize Streak Virus', severity: 'High', symptoms: ['Yellow streaks along leaf veins', 'Stunted growth', 'Narrow pale yellow streaks', 'Small plant size'], description: 'A viral disease transmitted by leafhoppers (Cicadulina species), causing significant yield losses.', causes: 'Virus spread by leafhopper insects feeding on infected plants.', prevention: 'Plant early; use resistant varieties; control leafhoppers with insecticides; remove infected plants.', treatment: 'No cure — remove and destroy infected plants. Control leafhopper vectors with registered insecticides.' },
  { crop: 'Maize', diseaseName: 'Northern Corn Leaf Blight', severity: 'Medium', symptoms: ['Long grey-green or tan cigar-shaped lesions on leaves', 'Lesions turn brown', 'Leaf dieback from tip'], description: 'Fungal disease caused by Setosphaeria turcica, most damaging when infection occurs before tasselling.', causes: 'Fungal spores spread by wind and rain; favoured by cool, moist conditions.', prevention: 'Rotate crops; use resistant hybrids; apply fungicide at early infection stage.', treatment: 'Fungicides containing propiconazole or mancozeb applied at early stages of infection.' },
  { crop: 'Maize', diseaseName: 'Common Rust', severity: 'Medium', symptoms: ['Small powdery reddish-brown pustules on both leaf surfaces', 'Yellow halo around pustules', 'Leaves may dry out'], description: 'Fungal disease caused by Puccinia sorghi; pustules release orange-red spores.', causes: 'Fungal spores spread by wind; cool temperatures and moist conditions favour development.', prevention: 'Plant resistant varieties; apply fungicides preventatively in high-risk seasons.', treatment: 'Apply fungicides (mancozeb or triazole-based) early when pustules first appear.' },
  { crop: 'Maize', diseaseName: 'Maize Lethal Necrosis', severity: 'High', symptoms: ['Leaf mottling and necrosis', 'Stunted growth', 'Barren cobs', 'Yellowing of leaves'], description: 'A serious viral disease causing severe yield losses in maize.', causes: 'Spread mainly by insect vectors and infected crop residue.', prevention: 'Use resistant maize varieties and remove infected plants promptly.', treatment: 'There is no cure; rogue infected plants and manage vectors.' },
  { crop: 'Maize', diseaseName: 'Smut', severity: 'Medium', symptoms: ['Large grey-black galls on ears or tassels', 'Malformed cobs', 'Breakdown of tissue'], description: 'Fungal disease affecting reproductive organs of maize.', causes: 'Soil and plant residue borne spores infect growing points.', prevention: 'Use clean seed and avoid field-entry when plants are wet.', treatment: 'Remove and destroy galls; avoid infected residues in the field.' },
  // ── Tomatoes ───────────────────────────────────────────────────────────────
  { crop: 'Tomato', diseaseName: 'Early Blight', severity: 'Medium', symptoms: ['Brown spots with concentric rings (target-board pattern)', 'Yellow area surrounding spot', 'Lower leaves affected first', 'Defoliation'], description: 'Fungal disease caused by Alternaria solani; affects leaves, stems, and fruit.', causes: 'Fungal spores thrive in warm, wet weather and on stressed plants.', prevention: 'Rotate crops; avoid overhead irrigation; remove infected leaves; use disease-free seed.', treatment: 'Apply copper-based fungicides or chlorothalonil at first appearance of symptoms.' },
  { crop: 'Tomato', diseaseName: 'Late Blight', severity: 'High', symptoms: ['Water-soaked greenish-grey spots on leaves', 'White mould on leaf undersides', 'Brown lesions on stems', 'Rapid plant death'], description: 'Caused by Phytophthora infestans; can destroy an entire crop within days in wet conditions.', causes: 'Oomycete pathogen spread by wind and rain; favoured by cool wet weather.', prevention: 'Use resistant varieties; avoid overhead watering; remove volunteer plants and infected debris.', treatment: 'Apply metalaxyl or copper-based fungicides. Remove and destroy infected plants immediately.' },
  { crop: 'Tomato', diseaseName: 'Bacterial Wilt', severity: 'High', symptoms: ['Sudden wilting of entire plant', 'Green leaves (wilt before yellowing)', 'Brown discolouration inside stem', 'Slimy ooze from cut stem in water'], description: 'Caused by Ralstonia solanacearum; spreads through soil and water.', causes: 'Soil-borne bacterium enters through roots; spread by contaminated water and tools.', prevention: 'Rotate crops (avoid solanaceous crops for 3+ years); use raised beds; sterilise tools; use resistant varieties.', treatment: 'No effective chemical cure. Remove and destroy infected plants. Improve soil drainage.' },
  { crop: 'Tomato', diseaseName: 'Tomato Yellow Leaf Curl', severity: 'High', symptoms: ['Leaf curling upward', 'Yellowing of leaves', 'Stunted growth', 'Reduced fruit set'], description: 'Viral disease spread by whiteflies.', causes: 'Whitefly vectors feed on infected plants and transmit the virus.', prevention: 'Use virus-free seedlings and control whitefly populations early.', treatment: 'No direct cure; remove infected plants and manage vectors.' },
  // ── Beans ──────────────────────────────────────────────────────────────────
  { crop: 'Beans', diseaseName: 'Angular Leaf Spot', severity: 'Medium', symptoms: ['Angular brown spots on leaves', 'Spots limited by leaf veins', 'Lesions on pods', 'Defoliation in severe cases'], description: 'Bacterial disease caused by Phaeoisariopsis griseola; common in humid conditions.', causes: 'Fungal spores spread by wind, rain splash, and infected seed.', prevention: 'Use certified disease-free seed; rotate crops; avoid overhead irrigation; use resistant varieties.', treatment: 'Apply copper-based fungicides; remove severely infected leaves.' },
  { crop: 'Beans', diseaseName: 'Bean Rust', severity: 'Medium', symptoms: ['Small reddish-brown pustules on leaf undersides', 'Yellowing of leaves', 'Premature leaf drop', 'White ring around pustules'], description: 'Fungal disease caused by Uromyces appendiculatus; can cause significant yield loss.', causes: 'Fungal spores spread by wind; favoured by warm, moist conditions.', prevention: 'Plant resistant varieties; practise crop rotation; avoid overhead irrigation.', treatment: 'Apply triazole or mancozeb-based fungicides at first sign of infection.' },
  { crop: 'Beans', diseaseName: 'Root Rot', severity: 'High', symptoms: ['Wilting despite moist soil', 'Stunting', 'Brown roots', 'Leaf yellowing'], description: 'Root disease linked to poor drainage and high soil moisture.', causes: 'Soil-borne fungi and waterlogging stress.', prevention: 'Improve drainage, rotate crops and avoid overwatering.', treatment: 'Use disease-free seed and improve drainage.' },
  // ── Sorghum ────────────────────────────────────────────────────────────────
  { crop: 'Sorghum', diseaseName: 'Anthracnose', severity: 'Medium', symptoms: ['Black leaf lesions', 'Leaf drying', 'Poor head development', 'Stunted plants'], description: 'Fungal disease affecting sorghum leaves and stalks.', causes: 'Favoured by wet conditions and warm temperatures.', prevention: 'Use resistant varieties and avoid infected residues.', treatment: 'Apply foliar fungicides when disease is detected early.' },
  { crop: 'Sorghum', diseaseName: 'Striga Infestation', severity: 'High', symptoms: ['Witchweed patches', 'Stunting', 'Poor vigor', 'Yellowing leaves'], description: 'Parasitic weed that reduces cereal productivity severely.', causes: 'Soil-borne seeds remain viable for many seasons.', prevention: 'Clean seed, intercrop, and improve soil fertility.', treatment: 'Hand weeding before seed set and use resistant cultivars.' },
  // ── Groundnuts ──────────────────────────────────────────────────────────────
  { crop: 'Groundnuts', diseaseName: 'Leaf Spot', severity: 'Medium', symptoms: ['Round dark spots on leaves', 'Leaf yellowing', 'Defoliation'], description: 'Common fungal disease in groundnuts during humid conditions.', causes: 'Moist conditions favour pathogen spread.', prevention: 'Use resistant varieties and rotate with cereals.', treatment: 'Apply recommended fungicide when disease starts.' },
  // ── Cotton ──────────────────────────────────────────────────────────────────
  { crop: 'Cotton', diseaseName: 'Bacterial Blight', severity: 'Medium', symptoms: ['Angular water-soaked spots', 'Bolls affected', 'Leaf drop'], description: 'Bacterial disease reducing cotton quality and yield.', causes: 'Favoured by wet weather and contaminated seed.', prevention: 'Use clean seed and crop rotation.', treatment: 'Apply bactericide according to label and rogue infected plants.' },
];

const ADVISORIES = [
  {
    crop: 'Maize', activity: 'Land Preparation',
    description: 'Prepare land before the rains to ensure optimal seedbed.',
    recommendedDate: new Date('2024-10-15'),
    instructions: 'Plough to a depth of 20-30 cm. Remove weeds and crop residues. If soil pH is below 5.5, apply lime at 1-2 tonnes/ha.',
    season: 'Main Season 2024/25',
  },
  {
    crop: 'Maize', activity: 'Planting',
    description: 'Plant maize at the onset of the first reliable rains.',
    recommendedDate: new Date('2024-11-15'),
    instructions: 'Plant seeds 5 cm deep, 25 cm apart in rows 90 cm apart. Use certified seed. Apply basal fertilizer (Compound D) at 200 kg/ha at planting.',
    season: 'Main Season 2024/25',
  },
  {
    crop: 'Maize', activity: 'Weeding (First)',
    description: 'First weeding to reduce competition for nutrients and moisture.',
    recommendedDate: new Date('2024-12-10'),
    instructions: 'Weed at 2-3 weeks after planting using a hoe or hand-pull weeds. Do not disturb roots.',
    season: 'Main Season 2024/25',
  },
  {
    crop: 'Maize', activity: 'Top Dressing',
    description: 'Apply nitrogen fertilizer to boost vegetative growth.',
    recommendedDate: new Date('2025-01-10'),
    instructions: 'Apply AN (Ammonium Nitrate) or CAN at 200 kg/ha when plants are 30-45 cm tall (V5-V6 stage). Avoid contact with leaves.',
    season: 'Main Season 2024/25',
  },
  {
    crop: 'Maize', activity: 'Fall Armyworm Inspection',
    description: 'Inspect crops for Fall Armyworm (Spodoptera frugiperda) damage.',
    recommendedDate: new Date('2025-01-20'),
    instructions: 'Check whorls of young plants for feeding damage and frass. Apply registered insecticide (e.g. Emamectin benzoate) if >20% plants are infested.',
    season: 'Main Season 2024/25',
  },
  {
    crop: 'Maize', activity: 'Harvesting',
    description: 'Harvest maize when grain moisture is below 25%.',
    recommendedDate: new Date('2025-04-01'),
    instructions: 'Harvest when husks are dry and brown. Dry cobs further to 12-13% moisture before storage. Store in ventilated cribs or metal silos.',
    season: 'Main Season 2024/25',
  },
];

const KNOWLEDGE_ARTICLES = [
  {
    title: 'Maize Production Guide for Agro-Ecological Region III',
    category: 'Farming Guide', crop: 'Maize',
    content: `Maize is the staple crop in Region III. The season typically runs from November to April with 500-750mm of rainfall.\n\n**Soil Preparation:** Deep plough before the rains. Target a fine, firm seedbed. Test soil pH and target 5.5-6.5.\n\n**Variety Selection:** Choose drought-tolerant, short-season varieties (90-110 days) such as SC403 or ZM309.\n\n**Planting Population:** Target 44,000 plants/ha. Space rows 90cm apart with 25cm between plants.\n\n**Fertilisation:** Compound D (7:14:7) at 200 kg/ha basal + AN at 200 kg/ha top dress at V5.\n\n**Water Management:** Maize is most sensitive to drought at silking (VT/R1 stage). Ensure adequate moisture during this critical period.`,
    tags: ['maize', 'planting', 'fertiliser', 'Region III'],
  },
  {
    title: 'Groundnut Production and Rotation in Region III',
    category: 'Farming Guide', crop: 'Groundnuts',
    content: `Groundnuts fit well into dry, warm areas of Region III when planted at the onset of rains. They are less water-intensive than maize and good for crop rotation.\n\n**Planting:** Plant 2-3 seeds per station, 5-7 cm deep, with 45 cm row spacing.\n\n**Soil:** Groundnuts do best in well-drained sandy loam and loamy sand soils.\n\n**Management:** Apply basal fertiliser with phosphorus and potash where low fertility is known. Inspect regularly for leaf spots and aphid attacks.`,
    tags: ['groundnuts', 'rotation', 'soil', 'planting'],
  },
  {
    title: 'Sorghum and Millet for Drought-Prone Fields',
    category: 'Farming Guide', crop: 'Sorghum',
    content: `Sorghum and millet are ideal where rainfall is limited or unreliable. They are more drought-tolerant than maize and perform well in light soils.\n\n**Planting Window:** Between November and January depending on rainfall.\n\n**Best Practice:** Use early-maturing varieties, plant in rows, and keep weed pressure low during establishment.\n\n**Soils:** Sorghum grows well on sandy loam and clay loam soils with moderate fertility.`,
    tags: ['sorghum', 'millet', 'drought', 'Region III'],
  },
  {
    title: 'Tomato Disease Prevention in Wet Seasons',
    category: 'Crop Protection', crop: 'Tomato',
    content: `Tomatoes in Region III are vulnerable to fungal and bacterial diseases during rainy weeks. Use drip irrigation, avoid water on leaves, and monitor for early symptoms.\n\n**Practices:** Mulch to reduce splash, rotate crops, and avoid close spacing. Remove infected leaves promptly.\n\n**Critical Alert:** Late blight and bacterial wilt spread quickly under humid conditions, so scouting every 3-4 days is recommended.`,
    tags: ['tomato', 'disease', 'late blight', 'wet season'],
  },
  {
    title: 'Integrated Pest Management for Smallholder Farmers',
    category: 'Pest Management', crop: 'General',
    content: `IPM combines multiple strategies to manage pests sustainably.\n\n**Key Principles:**\n1. Prevention — use resistant varieties, crop rotation, and healthy planting material.\n2. Monitoring — regularly inspect crops (at least twice a week) for pest signs.\n3. Threshold-based treatment — only spray when pest levels exceed economic thresholds.\n4. Biological control — encourage natural predators like parasitic wasps.\n5. Chemical control — use as last resort with registered, targeted pesticides.\n\n**Common Pests in Region III:**\n- Fall Armyworm (maize)\n- Aphids (beans, tomatoes)\n- Red Spider Mites (tomatoes, beans)\n- Cutworms (all crops at seedling stage)`,
    tags: ['IPM', 'pests', 'fall armyworm', 'spray'],
  },
  {
    title: 'Soil Fertility Management and Fertiliser Application',
    category: 'Fertilizer', crop: 'General',
    content: `Good soil fertility management is key to high yields in Region III soils, which are often sandy and low in organic matter.\n\n**Organic Matter:** Apply 5-10 tonnes/ha of compost or cattle manure before planting. This improves water retention and nutrient availability.\n\n**Basal Fertiliser:** Apply Compound D or Compound L at planting. Compound D (7:14:7) is recommended for most Region III soils.\n\n**Top Dressing:** Apply Ammonium Nitrate (AN) or CAN at 200 kg/ha at the V5-V6 stage for maize.\n\n**Micro-nutrients:** Watch for zinc deficiency (white striping on young leaves). Apply zinc sulphate at 10 kg/ha if deficiency is suspected.\n\n**Soil Testing:** Test soil every 3 years. Contact your local Agritex officer for soil sampling.`,
    tags: ['fertiliser', 'soil', 'compost', 'compound D'],
  },
  {
    title: 'Planning for the Main Cropping Season in Region III',
    category: 'Seasonal Advice', crop: 'General',
    content: `The season normally begins with early rains in November and continues through April. Farm planning should focus on moisture conservation, early planting, and soil fertility management.\n\n**Best Approach:** Prepare land early, plant early, apply basal fertiliser, and keep field records of planting date, crop type, and interventions.\n\n**Risk Area:** Rainfall is variable, so farmers should monitor the forecast and carry out timely weeding and pest scouting.`,
    tags: ['season', 'rainfall', 'timing', 'planning'],
  },
  {
    title: 'Beans and Pulse Crops for Smallholder Profitability',
    category: 'Crop Planning', crop: 'Beans',
    content: `Beans are a useful short-cycle crop for farmers wanting diverse production and soil improvement. They benefit from early planting and balanced fertility, especially phosphorus.\n\n**Planting Tips:** Use improved seed and plant with adequate spacing to reduce disease spread. Scout for rust and angular leaf spot, especially in high humidity.`,
    tags: ['beans', 'pulses', 'profitability', 'rotation'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Disease.deleteMany({}),
      Advisory.deleteMany({}),
      Knowledge.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@cropadvisory.zw',
      phone: '0771000000',
      password: 'Admin@1234',
      district: 'Harare',
      ward: 'Admin',
      role: 'admin',
    });
    console.log('👤 Admin created — email: admin@cropadvisory.zw | password: Admin@1234');

    // Create test farmer
    await User.create({
      fullName: 'John Moyo',
      email: 'farmer@test.zw',
      phone: '0771234567',
      password: 'Farmer@1234',
      district: 'Midlands',
      ward: 'Ward 5',
      farmName: 'Moyo Farm',
      farmSize: '2 hectares',
      role: 'farmer',
    });
    console.log('👨‍🌾 Test farmer created — email: farmer@test.zw | password: Farmer@1234');

    // Seed diseases
    await Disease.insertMany(DISEASES);
    console.log(`🦠 ${DISEASES.length} diseases seeded`);

    // Seed advisories
    const advisoriesWithAdmin = ADVISORIES.map((a) => ({ ...a, createdBy: admin._id }));
    await Advisory.insertMany(advisoriesWithAdmin);
    console.log(`📋 ${ADVISORIES.length} advisories seeded`);

    // Seed knowledge base
    const articlesWithAdmin = KNOWLEDGE_ARTICLES.map((a) => ({ ...a, createdBy: admin._id }));
    await Knowledge.insertMany(articlesWithAdmin);
    console.log(`📚 ${KNOWLEDGE_ARTICLES.length} knowledge articles seeded`);

    console.log('\n🌱 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
