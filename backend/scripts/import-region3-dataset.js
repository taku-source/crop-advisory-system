/**
 * Import the verified Region III JSON dataset into the structured knowledge collections.
 * Run from backend: node scripts/import-region3-dataset.js "D:\\Downloads\\verified-region-iii-dataset (1).json"
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');
const SoilData = require('../models/SoilData');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');

const datasetPath = process.argv[2];

function requireDataset() {
  if (!datasetPath) {
    throw new Error('Provide the dataset path as the first argument.');
  }

  const absolutePath = path.resolve(datasetPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Dataset not found: ${absolutePath}`);
  }

  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function sourceDetails(sourceMap, sourceIds) {
  const ids = [...new Set((Array.isArray(sourceIds) ? sourceIds : [sourceIds]).filter(Boolean))];
  const sources = ids.map((sourceId) => {
    const source = sourceMap.get(sourceId);
    if (!source) throw new Error(`Missing source definition for sourceId: ${sourceId}`);
    return source;
  });

  return {
    source: sources.map((source) => source.organisation || source.organization || 'Verified agricultural dataset').filter((value, index, list) => list.indexOf(value) === index).join('; '),
    reference: sources.map((source, index) => `${source.title || ids[index]} (${source.year || 'undated'})${source.url ? ` - ${source.url}` : ''}`).join(' | '),
    sourceIds: ids
  };
}

function parseRate(value) {
  if (typeof value !== 'string') return undefined;
  const match = value.match(/(\d+(?:\.\d+)?)\s*kg\s*\/\s*ha/i);
  return match ? Number(match[1]) : undefined;
}

function cropRules(dataset, cropName, sourceMap) {
  const cropId = cropName.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  const cropRules = (dataset.advisoryRules || []).filter((rule) =>
    rule.ruleId?.toUpperCase().includes(`-${cropId}-`) ||
    rule.conditions?.some((condition) => condition.toLowerCase().includes(cropName.toLowerCase()))
  );

  return cropRules.map((rule) => ({
    ...rule,
    ...sourceDetails(sourceMap, rule.sourceIds)
  }));
}

function cropPests(dataset, cropId, sourceMap) {
  return (dataset.pestKnowledge || [])
    .filter((pest) => pest.pestId?.startsWith(cropId) || pest.pestId?.startsWith(`${cropId}-`))
    .map((pest) => ({
      ...pest,
      ...sourceDetails(sourceMap, pest.sourceId ? [pest.sourceId] : [])
    }));
}

function mapAgriculturalKnowledge(dataset, sourceMap) {
  return (dataset.crops || []).map((crop) => {
    const cropName = crop.cropName || crop.name || crop.crop;
    const cropId = crop.cropId || cropName?.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    if (!cropName) throw new Error('Every dataset crop must contain cropName, name, or crop.');
    const rules = cropRules(dataset, cropName, sourceMap);
    const pests = cropPests(dataset, cropId, sourceMap);
    const sourceIds = [
      crop.sourceId,
      dataset.regionKnowledge?.sourceId,
      crop.fertilizer?.sourceId,
      ...(crop.planting?.spacingOptions || []).map((option) => option.sourceId),
      crop.planting?.sourceId,
      crop.weedManagement?.sourceId,
      ...rules.flatMap((rule) => rule.sourceIds || []),
      ...pests.flatMap((pest) => pest.sourceIds || [])
    ].filter(Boolean);
    const references = sourceDetails(sourceMap, sourceIds);
    const plantingPeriod = crop.planting?.period || crop.plantingPeriod || 'Not specified in verified dataset; confirm with AGRITEX';
    const fertilizer = crop.fertilizer || {};
    const fertilizerRecords = [
      ...(fertilizer.basal ? [{ type: 'Basal', rateKgPerHa: parseRate(fertilizer.basal), timing: 'At planting', description: fertilizer.basal }] : []),
      ...(fertilizer.topDressing ? [{ type: 'Top dressing', rateKgPerHa: parseRate(fertilizer.topDressing), timing: 'Top dressing', description: fertilizer.topDressing }] : []),
      ...(fertilizer.additional ? [{ type: 'Additional', rateKgPerHa: parseRate(fertilizer.additional), timing: 'As specified in verified dataset', description: fertilizer.additional }] : []),
      ...(fertilizer.note ? [{ type: 'Note', timing: 'Before application', description: fertilizer.note }] : [])
    ];

    return {
      cropName,
      variety: crop.variety || '',
      agroEcologicalRegion: 'III',
      plantingPeriod,
      plantingWindow: crop.planting?.window || {},
      growthStages: (crop.stages || []).map((stage) => ({
        stageName: stage,
        daysAfterPlanting: undefined,
        activities: rules
          .filter((rule) => rule.stage === stage)
          .flatMap((rule) => rule.actions.map((action) => ({
            activityName: action,
            description: `${rule.why} Conditions: ${rule.conditions.join('; ')}.`,
            timing: stage
          })))
      })),
      fertiliserRecs: fertilizerRecords,
      pestDiseaseManagement: pests.map((pest) => ({
        pestName: pest.pestName,
        controlMeasures: [...(pest.management || []), ...(pest.thresholds || []).map((threshold) => `Threshold: ${JSON.stringify(threshold)}`)].join('; '),
        preventiveMeasures: (pest.risk || []).join('; ')
      })),
      soilRequirements: {
        preferredType: Array.isArray(crop.soil) ? crop.soil.join('; ') : crop.soil || '',
        requirements: crop.soilNotes || ''
      },
      waterRequirements: {
        rainfallNeeded: dataset.regionKnowledge.rainfallSourceValues
          ?.map((value) => `${value.minMm}-${value.maxMm} mm`)
          .join('; ') || '',
        criticalStages: crop.water?.criticalStages || '',
        irrigationTips: crop.water?.irrigationTips || ''
      },
      plantingDetails: crop.planting || null,
      weedManagement: crop.weedManagement || null,
      advisoryRules: rules,
      pestKnowledge: pests,
      source: references.source,
      reference: references.reference,
      sourceIds: references.sourceIds,
      datasetName: dataset.datasetMetadata?.datasetName || '',
      datasetVersion: dataset.datasetMetadata?.datasetVersion || ''
    };
  });
}

function mapSoilData(dataset, sourceMap) {
  return (dataset.soilData || []).map((soil) => {
    const references = sourceDetails(sourceMap, [soil.sourceId]);
    return {
      soilType: soil.soilType,
      agroEcologicalRegion: 'III',
      characteristics: {
        texture: Array.isArray(soil.characteristics) ? soil.characteristics.join('; ') : soil.characteristics || '',
        structure: '',
        color: '',
        organicMatter: ''
      },
      suitableCrops: soil.suitableCrops || [],
      unsuitableCrops: soil.unsuitableCrops || [],
      drainage: {
        type: soil.drainage || '',
        characteristics: ''
      },
      fertility: {
        rating: soil.fertility || '',
        limitingNutrients: soil.limitingNutrients || [],
        recommendations: ''
      },
      managementPractices: (soil.management || []).map((practice) => ({
        practice,
        description: practice,
        timing: 'As stated in the verified dataset'
      })),
      amendments: [],
      source: references.source,
      reference: references.reference,
      sourceIds: references.sourceIds,
      datasetName: dataset.datasetMetadata?.datasetName || '',
      datasetVersion: dataset.datasetMetadata?.datasetVersion || ''
    };
  });
}

function mapDiseaseKnowledge(dataset, sourceMap) {
  return (dataset.diseaseKnowledge || []).map((disease) => {
    const references = sourceDetails(sourceMap, [disease.sourceId]);
    return {
      diseaseName: disease.diseaseName || disease.diseaseId,
      crop: disease.affectedCrop,
      agroEcologicalRegion: 'III',
      symptoms: (disease.symptomWeights || disease.symptoms || []).map((symptom) => ({
        symptom: typeof symptom === 'string' ? symptom : symptom.name,
        weight: typeof symptom === 'string' ? 5 : symptom.weight || 5,
        description: '',
        affectedParts: []
      })),
      causes: '',
      causativeAgent: '',
      favourableConditions: [],
      severity: 'Medium',
      severityDescription: '',
      managementMeasures: (disease.management || []).map((measure) => ({
        measure,
        description: 'Follow the verified dataset guidance and current approved label.',
        timing: ''
      })),
      preventiveMeasures: (disease.prevention || []).map((measure) => ({
        measure,
        description: 'Apply as part of an integrated management approach.'
      })),
      yield_loss: '',
      economicImportance: '',
      source: references.source,
      reference: references.reference,
      sourceIds: references.sourceIds,
      datasetName: dataset.datasetMetadata?.datasetName || '',
      datasetVersion: dataset.datasetMetadata?.datasetVersion || '',
      algorithmNote: disease.algorithmNote || ''
    };
  });
}

async function run() {
  const dataset = requireDataset();
  const datasetRegion = dataset.datasetMetadata?.agroEcologicalRegion || dataset.datasetMetadata?.region;
  if (datasetRegion !== 'III') {
    throw new Error('Dataset is not marked as Agro-Ecological Region III.');
  }

  const sourceMap = new Map((dataset.sources || []).map((source) => [source.sourceId, source]));
  const agriculturalKnowledge = mapAgriculturalKnowledge(dataset, sourceMap);
  const soilData = mapSoilData(dataset, sourceMap);
  const diseaseKnowledge = mapDiseaseKnowledge(dataset, sourceMap);

  if (!agriculturalKnowledge.length || !soilData.length || !diseaseKnowledge.length) {
    throw new Error('Dataset must contain crops, soilData, and diseaseKnowledge records.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    await AgriculturalKnowledge.deleteMany({ agroEcologicalRegion: 'III' });
    await SoilData.deleteMany({ agroEcologicalRegion: 'III' });
    await DiseaseKnowledge.deleteMany({ agroEcologicalRegion: 'III' });

    await AgriculturalKnowledge.insertMany(agriculturalKnowledge);
    await SoilData.insertMany(soilData);
    await DiseaseKnowledge.insertMany(diseaseKnowledge);

    console.log(JSON.stringify({
      dataset: dataset.datasetMetadata.datasetName,
      version: dataset.datasetMetadata.datasetVersion,
      imported: {
        agriculturalKnowledge: agriculturalKnowledge.length,
        soilData: soilData.length,
        diseaseKnowledge: diseaseKnowledge.length
      }
    }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error(`Import failed: ${error.message}`);
  process.exitCode = 1;
});
