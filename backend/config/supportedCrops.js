const SUPPORTED_CROPS = Object.freeze([
  'Maize',
  'Sorghum',
  'Pearl Millet',
  'Cowpeas',
  'Groundnuts',
  'Sunflower',
  'Cotton'
]);

const normalizeCrop = (crop) => String(crop || '').trim().toLowerCase();

const isSupportedCrop = (crop) => SUPPORTED_CROPS.some(
  (supportedCrop) => normalizeCrop(supportedCrop) === normalizeCrop(crop)
);

module.exports = { SUPPORTED_CROPS, normalizeCrop, isSupportedCrop };