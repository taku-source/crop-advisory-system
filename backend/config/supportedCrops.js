const supportedCrops = [
  {
    name: 'Sorghum',
    aliases: ['Sorghum, rapoko and pearl millet'],
    description: 'Highly drought-tolerant staple grain.',
    icon: '🌾'
  },
  {
    name: 'Pearl Millet',
    aliases: ['Sorghum, rapoko and pearl millet'],
    description: 'Thrives during mid-season dry spells.',
    icon: '🌱'
  },
  {
    name: 'Cowpeas',
    aliases: [],
    description: 'Resilient legume providing food and fodder.',
    icon: '🫘'
  },
  {
    name: 'Groundnuts',
    aliases: [],
    description: 'Excellent cash and food crop.',
    icon: '🥜'
  },
  {
    name: 'Sunflowers',
    aliases: ['Sunflower'],
    description: 'Hardy oilseed requiring minimal moisture.',
    icon: '🌻'
  },
  {
    name: 'Cotton',
    aliases: [],
    description: 'Reliable, heat-tolerant commercial cash crop.',
    icon: '🌿'
  },
  {
    name: 'Maize',
    aliases: [],
    description: 'Requires short-season, drought-tolerant hybrid seeds.',
    icon: '🌽'
  }
];

const getSupportedCrop = (name) => supportedCrops.find((crop) =>
  crop.name.toLowerCase() === String(name).toLowerCase() ||
  crop.aliases.some((alias) => alias.toLowerCase() === String(name).toLowerCase())
);

const getSupportedCropNames = (name) => {
  const crop = getSupportedCrop(name);
  return crop ? [crop.name, ...crop.aliases] : [name];
};

const getSupportedCrops = (names = []) => names.map(getSupportedCrop).filter(Boolean);

module.exports = { supportedCrops, getSupportedCrop, getSupportedCropNames, getSupportedCrops };
