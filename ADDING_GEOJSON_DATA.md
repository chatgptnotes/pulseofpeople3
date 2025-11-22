# Adding Actual GeoJSON Data for States

**Date**: November 20, 2025
**Status**: Phase 1 Complete - Placeholders Ready

---

## Current Status

### Phase 1: Infrastructure (✅ Complete)
- ✅ Created placeholder GeoJSON files for 9 states
- ✅ Added switch cases in AdminStateDashboard.tsx
- ✅ Updated database: all 10 states have `has_geojson=true`
- ✅ Maps will load but show no constituency boundaries (empty features array)

### Phase 2: Add Real Data (To Do)
This guide explains how to replace placeholder files with actual constituency boundary data.

---

## Quick Reference

**Placeholder Files Created**:
- `src/assets/maps/maharashtra-constituencies.json` (MH)
- `src/assets/maps/delhi-constituencies.json` (DL)
- `src/assets/maps/punjab-constituencies.json` (PB)
- `src/assets/maps/uttarpradesh-constituencies.json` (UP)
- `src/assets/maps/karnataka-constituencies.json` (KA)
- `src/assets/maps/gujarat-constituencies.json` (GJ)
- `src/assets/maps/westbengal-constituencies.json` (WB)
- `src/assets/maps/rajasthan-constituencies.json` (RJ)
- `src/assets/maps/madhyapradesh-constituencies.json` (MP)

**Working Example**: `src/assets/maps/tamilnadu-constituencies.json` (TN) - Use this as reference

---

## Data Sources

### Option 1: DataMeet Repository (Recommended)
**URL**: https://github.com/datameet/maps

**Files Location**: `assembly-constituencies/` directory

**Format**: Shapefiles (.shp, .dbf, .prj, .shx)

**State Codes**:
- Maharashtra: `mh_ac.shp`
- Delhi: `dl_ac.shp`
- Punjab: `pb_ac.shp`
- Uttar Pradesh: `up_ac.shp`
- Karnataka: `ka_ac.shp`
- Gujarat: `gj_ac.shp`
- West Bengal: `wb_ac.shp`
- Rajasthan: `rj_ac.shp`
- Madhya Pradesh: `mp_ac.shp`

### Option 2: Other Sources
- Election Commission of India (ECI) - Official boundaries
- Survey of India - High-quality geographic data
- OpenStreetMap - Community-maintained boundaries

---

## Converting Shapefiles to GeoJSON

### Method 1: Using ogr2ogr (Command Line)

**Requirements**: Install GDAL toolkit
```bash
# macOS
brew install gdal

# Ubuntu/Debian
sudo apt-get install gdal-bin

# Windows
# Download from https://www.gisinternals.com/
```

**Conversion Command**:
```bash
# Basic conversion
ogr2ogr -f GeoJSON output.json input.shp

# With coordinate system conversion (recommended)
ogr2ogr -f GeoJSON -t_srs EPSG:4326 output.json input.shp

# Example: Maharashtra
ogr2ogr -f GeoJSON \
  -t_srs EPSG:4326 \
  maharashtra-constituencies.json \
  /tmp/datameet-maps/assembly-constituencies/mh_ac.shp
```

**Parameters Explained**:
- `-f GeoJSON`: Output format
- `-t_srs EPSG:4326`: Convert to WGS84 (standard web mapping projection)
- Output file: Your GeoJSON filename
- Input file: Shapefile path

### Method 2: Using QGIS (GUI Tool)

**Requirements**: Install QGIS (https://qgis.org/)

**Steps**:
1. Open QGIS Desktop
2. **Layer** → **Add Layer** → **Add Vector Layer**
3. Select the `.shp` file (e.g., `mh_ac.shp`)
4. Right-click layer → **Export** → **Save Features As**
5. Format: `GeoJSON`
6. CRS: `EPSG:4326 - WGS 84`
7. Click **OK**

### Method 3: Using Online Converters

**Websites**:
- https://mapshaper.org/ (Best for optimization)
- https://mygeodata.cloud/converter/shp-to-geojson

**Steps**:
1. Upload `.shp` file (will also need `.dbf`, `.shx`, `.prj`)
2. Select output format: GeoJSON
3. Download converted file

---

## Optimizing GeoJSON Files

Large GeoJSON files can slow down the browser. Optimize before using.

### Using Mapshaper (Recommended)

**Online**: https://mapshaper.org/

**Steps**:
1. Upload your GeoJSON file
2. Open console (click "Console" button)
3. Run simplification command:
   ```
   simplify 10% keep-shapes
   ```
4. Export as GeoJSON

**Command Line**:
```bash
# Install mapshaper
npm install -g mapshaper

# Simplify geometry (reduce file size)
mapshaper input.json -simplify 10% keep-shapes -o output.json

# Example: Optimize Maharashtra
mapshaper maharashtra-constituencies.json \
  -simplify 10% keep-shapes \
  -o maharashtra-constituencies-optimized.json
```

**File Size Targets**:
- Small states (Delhi): < 500 KB
- Medium states (Punjab, Karnataka): < 2 MB
- Large states (UP, Maharashtra): < 5 MB

---

## GeoJSON Structure Reference

Your converted file should match this structure (example from Tamil Nadu):

```json
{
  "type": "FeatureCollection",
  "name": "India_AC_StateName",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "OBJECTID": 1,
        "ST_CODE": 27,
        "ST_NAME": "MAHARASHTRA",
        "DT_CODE": 1,
        "DIST_NAME": "Mumbai City",
        "AC_NO": 1,
        "AC_NAME": "Colaba",
        "PC_NO": 1,
        "PC_NAME": "Mumbai South"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [72.8234, 18.9234],
            [72.8345, 18.9345],
            ...
          ]
        ]
      }
    },
    ...
  ]
}
```

**Required Fields**:
- `type`: Must be "FeatureCollection"
- `features`: Array of constituency features
- Each feature must have:
  - `type`: "Feature"
  - `properties`: Constituency metadata (name, code, etc.)
  - `geometry`: Polygon or MultiPolygon coordinates

---

## Adding Data to Project

### Step 1: Replace Placeholder File

Once you have the optimized GeoJSON file:

```bash
# Navigate to project
cd "/Users/apple/1 imo backups/pulseofproject python 3/pulseofprojectfrontendonly"

# Copy your file (replace existing placeholder)
cp ~/Downloads/maharashtra-constituencies.json \
   src/assets/maps/maharashtra-constituencies.json
```

### Step 2: Verify File Structure

```bash
# Check if valid JSON
cat src/assets/maps/maharashtra-constituencies.json | jq '.type'
# Should output: "FeatureCollection"

# Count features (constituencies)
cat src/assets/maps/maharashtra-constituencies.json | jq '.features | length'
# Maharashtra has 288 assembly constituencies
```

### Step 3: Test in Development

```bash
# Start backend (Terminal 1)
cd backend
python3 manage.py runserver 8000

# Start frontend (Terminal 2)
cd pulseofprojectfrontendonly
npm run dev
```

**Testing**:
1. Login as Maharashtra admin
2. Navigate to dashboard
3. Verify map loads with constituency boundaries
4. Check browser console for errors

### Step 4: Production Build Test

```bash
# Build for production
npm run build

# Should complete without errors
# Check build output for:
# ✓ built in XXs
# No import resolution errors
```

### Step 5: Commit Changes

```bash
git add src/assets/maps/maharashtra-constituencies.json
git commit -m "feat: Add constituency boundary data for Maharashtra

- Replaced placeholder with actual DataMeet data
- 288 assembly constituencies included
- File optimized with mapshaper (simplified 10%)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Batch Processing All States

If you want to process all 9 states at once:

```bash
#!/bin/bash
# batch-convert-geojson.sh

# Set paths
DATAMEET_DIR="/tmp/datameet-maps/assembly-constituencies"
OUTPUT_DIR="./src/assets/maps"

# State mappings: code=filename
declare -A states=(
  ["MH"]="mh_ac"
  ["DL"]="dl_ac"
  ["PB"]="pb_ac"
  ["UP"]="up_ac"
  ["KA"]="ka_ac"
  ["GJ"]="gj_ac"
  ["WB"]="wb_ac"
  ["RJ"]="rj_ac"
  ["MP"]="mp_ac"
)

# State name mappings for output files
declare -A state_names=(
  ["MH"]="maharashtra"
  ["DL"]="delhi"
  ["PB"]="punjab"
  ["UP"]="uttarpradesh"
  ["KA"]="karnataka"
  ["GJ"]="gujarat"
  ["WB"]="westbengal"
  ["RJ"]="rajasthan"
  ["MP"]="madhyapradesh"
)

# Convert each state
for code in "${!states[@]}"; do
  input_file="${DATAMEET_DIR}/${states[$code]}.shp"
  temp_file="/tmp/${state_names[$code]}-temp.json"
  output_file="${OUTPUT_DIR}/${state_names[$code]}-constituencies.json"

  echo "Processing $code (${state_names[$code]})..."

  # Convert with ogr2ogr
  ogr2ogr -f GeoJSON -t_srs EPSG:4326 "$temp_file" "$input_file"

  # Optimize with mapshaper
  mapshaper "$temp_file" \
    -simplify 10% keep-shapes \
    -o "$output_file"

  # Cleanup
  rm "$temp_file"

  echo "✅ Completed: $output_file"
done

echo "🎉 All states converted!"
```

**Usage**:
```bash
chmod +x batch-convert-geojson.sh
./batch-convert-geojson.sh
```

---

## Troubleshooting

### Issue: "Cannot read properties of null"
**Cause**: Invalid GeoJSON structure
**Fix**: Validate file at https://geojsonlint.com/

### Issue: Map shows nothing after adding data
**Cause**: Wrong coordinate system
**Fix**: Re-convert with `-t_srs EPSG:4326`

### Issue: Browser freezes on map load
**Cause**: File too large (>10 MB)
**Fix**: Increase simplification: `mapshaper -simplify 5% keep-shapes`

### Issue: Constituencies not appearing correctly
**Cause**: Geometry type mismatch
**Fix**: Check if geometries are Polygon or MultiPolygon (both supported)

### Issue: Build fails with "Cannot find module"
**Cause**: File not in correct location
**Fix**: Ensure file is in `src/assets/maps/` and matches switch case filename

---

## Quality Checklist

Before committing new GeoJSON data, verify:

- [ ] File is valid JSON (use `jq` or jsonlint.com)
- [ ] File is valid GeoJSON (use geojsonlint.com)
- [ ] File size < 5 MB (optimize if larger)
- [ ] CRS is EPSG:4326 (WGS 84)
- [ ] Feature count matches expected constituencies
- [ ] Properties include constituency names
- [ ] Dev server loads map without errors
- [ ] Production build completes successfully
- [ ] No console errors in browser
- [ ] Constituency boundaries render correctly

---

## Current System Status

**States with Real Data**: 1/10
- ✅ Tamil Nadu (234 constituencies) - Working

**States with Placeholders**: 9/10
- ⏳ Maharashtra (288 constituencies)
- ⏳ Delhi (70 constituencies)
- ⏳ Punjab (117 constituencies)
- ⏳ Uttar Pradesh (403 constituencies)
- ⏳ Karnataka (224 constituencies)
- ⏳ Gujarat (182 constituencies)
- ⏳ West Bengal (294 constituencies)
- ⏳ Rajasthan (200 constituencies)
- ⏳ Madhya Pradesh (230 constituencies)

**Total**: 2,242 assembly constituencies across 10 states

---

## Next Steps

1. **Download DataMeet Shapefiles** for target state
2. **Convert to GeoJSON** using ogr2ogr or QGIS
3. **Optimize file** using mapshaper (10% simplification)
4. **Replace placeholder** in `src/assets/maps/`
5. **Test locally** with dev server
6. **Build and verify** no errors
7. **Commit changes** with descriptive message

---

## Additional Resources

- **DataMeet Repository**: https://github.com/datameet/maps
- **GDAL Documentation**: https://gdal.org/programs/ogr2ogr.html
- **Mapshaper Tool**: https://mapshaper.org/
- **GeoJSON Spec**: https://geojson.org/
- **GeoJSON Validator**: https://geojsonlint.com/
- **QGIS Download**: https://qgis.org/en/site/forusers/download.html

---

**Last Updated**: November 20, 2025
**Maintainer**: Development Team
**Version**: 1.0
