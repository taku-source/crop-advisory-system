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

const canonicalCrop = (crop) => {
  const normalized = normalizeCrop(crop);
  return SUPPORTED_CROPS.find((supportedCrop) => normalizeCrop(supportedCrop) === normalized)
    || SUPPORTED_CROPS.find((supportedCrop) => normalizeCrop(supportedCrop) === normalized.replace(/s$/, ''))
    || crop;
};

const isSupportedCrop = (crop) => SUPPORTED_CROPS.some(
  (supportedCrop) => normalizeCrop(supportedCrop) === normalizeCrop(crop)
);

module.exports = { SUPPORTED_CROPS, normalizeCrop, canonicalCrop, isSupportedCrop };