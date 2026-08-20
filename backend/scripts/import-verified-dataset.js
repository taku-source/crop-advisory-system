/**
 * Import a verified Region III dataset.
 *
 * Expected JSON shape:
 * {
 *   "agriculturalKnowledge": [],
 *   "soilData": [],
 *   "diseaseKnowledge": []
 * }
 *
 * Every record must include source and reference. Records are restricted to
 * Agro-Ecological Region III unless --allow-other-regions is supplied.
 * Run: node scripts/import-verified-dataset.js path/to/dataset.json
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');
const SoilData = require('../models/SoilData');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');

const filePath = process.argv[2];
const allowOtherRegions = process.argv.includes('--allow-other-regions');

function fail(message) {
  throw new Error(message);
}

function readDataset() {
  if (!filePath) fail('Usage: node scripts/import-verified-dataset.js path/to/dataset.json');
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) fail(`Dataset not found: ${absolutePath}`);

  let dataset;
  try {
    dataset = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  } catch (error) {
    fail(`Dataset is not valid JSON: ${error.message}`);
  }

  if (!dataset || typeof dataset !== 'object') fail('Dataset root must be an object');
  return dataset;
}

function validateRecords(name, records) {
  if (records === undefined) return [];
  if (!Array.isArray(records)) fail(`${name} must be an array`);

  records.forEach((record, index) => {
    if (!record || typeof record !== 'object') fail(`${name}[${index}] must be an object`);
    if (!record.source || !record.reference) {
      fail(`${name}[${index}] must include source and reference`);
    }
    if (!allowOtherRegions && record.agroEcologicalRegion && record.agroEcologicalRegion !== 'III') {
      fail(`${name}[${index}] is outside Agro-Ecological Region III`);
    }
  });

  return records;
}

async function importDataset() {
  const dataset = readDataset();
  const agriculturalKnowledge = validateRecords('agriculturalKnowledge', dataset.agriculturalKnowledge);
  const soilData = validateRecords('soilData', dataset.soilData);
  const diseaseKnowledge = validateRecords('diseaseKnowledge', dataset.diseaseKnowledge);

  if (!agriculturalKnowledge.length && !soilData.length && !diseaseKnowledge.length) {
    fail('Dataset contains no importable records');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    if (agriculturalKnowledge.length) {
      await AgriculturalKnowledge.deleteMany({ agroEcologicalRegion: 'III' });
      await AgriculturalKnowledge.insertMany(agriculturalKnowledge);
    }
    if (soilData.length) {
      await SoilData.deleteMany({ agroEcologicalRegion: 'III' });
      await SoilData.insertMany(soilData);
    }
    if (diseaseKnowledge.length) {
      await DiseaseKnowledge.deleteMany({ agroEcologicalRegion: 'III' });
      await DiseaseKnowledge.insertMany(diseaseKnowledge);
    }

    console.log(JSON.stringify({
      imported: {
        agriculturalKnowledge: agriculturalKnowledge.length,
        soilData: soilData.length,
        diseaseKnowledge: diseaseKnowledge.length
      },
      region: allowOtherRegions ? 'multiple regions allowed' : 'III'
    }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

importDataset().catch((error) => {
  console.error(`Import failed: ${error.message}`);
  process.exitCode = 1;
});
