# Verified Dataset Import

The advisory system accepts verified Region III records in JSON format. Keep the original source and reference with every record so recommendations remain traceable.

## File shape

```json
{
  "agriculturalKnowledge": [],
  "soilData": [],
  "diseaseKnowledge": []
}
```

The arrays use the fields defined by:

- `models/AgriculturalKnowledge.js`
- `models/SoilData.js`
- `models/DiseaseKnowledge.js`

Every record must include:

- `source`: organization or dataset name
- `reference`: report, publication, URL, version, or page reference
- `agroEcologicalRegion`: `III` for Region III data

## Import

```bash
cd backend
npm run import:verified -- ../path/to/verified-dataset.json
```

The importer validates the JSON, rejects records without provenance, rejects non-Region III records by default, replaces existing Region III records in the three structured collections, and prints import counts.

Use `--allow-other-regions` only when intentionally importing a multi-region dataset.

## Sources and weather

Agricultural, soil, and disease guidance should come from the verified dataset and remain in MongoDB. NASA POWER supplies historical and recent environmental observations from the farmer's GPS coordinates. NASA POWER does not require an API key, and it should not be described as a precise short-term forecast provider.
