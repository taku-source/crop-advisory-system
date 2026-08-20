# Verified Dataset Import

The advisory system accepts verified Region III records in JSON format. Keep the original source and reference with every record so recommendations remain traceable.

## File shape

```json
{
  "datasetMetadata": { "version": "5.0.0", "includedCrops": [] },
  "sources": [],
  "agricultural_knowledge": [],
  "soil_data": [],
  "disease_knowledge": []
}
```

The importer also accepts the legacy `crops`, `soilData`, and `diseaseKnowledge` shape. The v5 arrays use nested source objects on each verified record and are normalized into the MongoDB models defined by:

- `models/AgriculturalKnowledge.js`
- `models/SoilData.js`
- `models/DiseaseKnowledge.js`

Every v5 record must include:

- crop or disease identity and `region: "III"`
- source organisation, title, year, section, and URL through the referenced source object
- weighted disease symptoms where applicable

The importer preserves source organisations, references, URLs, years, sections, source IDs, dataset name, and dataset version on every imported record.

## Import

```bash
cd backend
npm run import:verified -- ../path/to/verified-dataset.json
```

The importer validates the JSON, rejects records without provenance, rejects non-Region III records by default, replaces existing Region III records in the three structured collections, and prints import counts.

Use `--allow-other-regions` only when intentionally importing a multi-region dataset.

## Sources and weather

Agricultural, soil, and disease guidance should come from the verified dataset and remain in MongoDB. NASA POWER supplies historical and recent environmental observations from the farmer's GPS coordinates. NASA POWER does not require an API key, and it should not be described as a precise short-term forecast provider.
