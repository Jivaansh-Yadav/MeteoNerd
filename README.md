# MeteoNerd

> Point anywhere on Earth. Get everything the atmosphere has.

A hyperlocal weather intelligence web app that exposes every atmospheric parameter Open-Meteo provides — organized, categorized, and always complete. Built for people who want more than a temperature and a cloud icon.

---

## Live

**https://meteonerd.pages.dev**

---

## What It Does

MeteoNerd fetches the full depth of Open-Meteo's forecast API for any location on Earth and presents it in collapsible category sections. No data is hidden, summarized away, or omitted. Every parameter is labelled, valued, and unitized.

It is not a casual weather app. It is a weather instrument.

---

## Features

### Location Input — Three Modes

| Mode | Description |
|------|-------------|
| **Device Location** | One-click GPS via browser `navigator.geolocation` |
| **Country + Place Search** | Select from 250 countries → fuzzy search 13.4M+ places worldwide |
| **Manual Coordinates** | Enter latitude and longitude directly |

Place search is powered by a Cloudflare D1 database containing **13.4 million places** sourced from GeoNames, queried via a Cloudflare Worker with Fuse.js client-side re-ranking and match highlighting.

---

### Weather Data

All data is fetched from the [Open-Meteo API](https://open-meteo.com/en/docs) in parallel calls and merged into a unified response. Parameters are organized into accordion sections:

| Section | Key Parameters |
|---------|---------------|
| **Current Conditions** | Temperature, humidity, wind, precipitation, pressure, weather code |
| **Temperature & Humidity** | 2m/80m/120m/180m temps, dew point, wet bulb, apparent temp, water vapour |
| **Wind** | Speed and direction at 10m/80m/120m/180m, gusts |
| **Precipitation** | Rain, showers, snowfall, snow depth, probability, all daily sums |
| **Cloud & Atmosphere** | Cloud cover (total/low/mid/high), visibility, ET₀, vapour pressure deficit, boundary layer height |
| **Solar & Radiation** | Shortwave, direct, diffuse, DNI, GTI, terrestrial radiation (averaged + instant), UV index, sunshine duration |
| **Soil** | Temperature and moisture at 0/6/18/54cm depths |
| **Pressure & Instability** | Surface pressure, MSLP, CAPE, lifted index, convective inhibition, freezing level |
| **Upper Air / Pressure Levels** | Temperature, humidity, cloud cover, wind, geopotential height at 19 pressure levels from 1000hPa to 30hPa |
| **15-Minutely** | High-resolution sub-hourly data (interpolated outside Europe/North America) |
| **Hourly Forecast** | 168-hour scrollable timeline |
| **Daily Summary** | 16-day aggregates — min/max/mean for all major variables |

---

### Additional Features

- **Forecast model selector** — ECMWF, GFS, ICON, Météo-France, JMA, GEM, UK Met Office, KMA, CMA, BOM, or auto best-match
- **Unit toggle** — Metric / Imperial, applied client-side without re-fetching
- **Raw JSON toggle** — per accordion, view the exact API response subset
- **Light / Dark theme** — system preference detected on load, persisted to localStorage
- **WMO weather code mapping** — all codes mapped to human-readable condition strings
- **Condition-reactive hero** — static sky gradient tied to current weather condition and day/night state
- **Telemetry ticker** — live scrolling strip of 10 key values across the hero card

---

## Architecture

```
Browser
  └── MeteoNerd (TanStack Start, React 19, Tailwind, shadcn/ui)
        ├── Location Input
        │     ├── Mode 1: navigator.geolocation
        │     ├── Mode 2: Country dropdown → Place search
        │     │           └── Cloudflare Worker (meteonerd-places)
        │     │                 └── Cloudflare D1 (13.4M places, GeoNames)
        │     └── Mode 3: Manual lat/lon
        │
        └── Weather Fetch (4 parallel calls)
              ├── Call 1: current + core hourly + daily → Open-Meteo API
              ├── Call 2: atmosphere + radiation + soil → Open-Meteo API
              ├── Call 3: pressure level variables → Open-Meteo API
              └── Call 4: minutely_15 → Open-Meteo API
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | TanStack Router |
| Data fetching | TanStack Query |
| Search | [Fuse.js](https://fusejs.io/) |
| Weather API | [Open-Meteo](https://open-meteo.com/) (free, no key required) |
| Places database | Cloudflare D1 (SQLite at edge) |
| Places API | Cloudflare Worker |
| Hosting | Cloudflare Pages |
| Place data source | [GeoNames](https://www.geonames.org/) allCountries dump |

---

## Places Data Pipeline

The worldwide place search is built from a one-time data pipeline:

```
GeoNames country dumps (250 × .txt.gz)
  → Downloaded via parallel curl (bash script, -P 10)
  → Stripped to name / lat / lon only (awk)
  → Imported into SQLite (places.db, 953MB)
  → Dumped to SQL (sqlite3 .dump)
  → Transaction statements stripped (sed)
  → Uploaded to Cloudflare D1 via wrangler
  → 13,439,723 rows, indexed on (country, name)
```

Search query:
```sql
SELECT name, lat, lon
FROM places
WHERE country = ?
AND name LIKE ?
ORDER BY name ASC
LIMIT 50
```

Results are re-ranked client-side with Fuse.js fuzzy search and rendered with match-boundary highlighting identical to the country search.

---

## Places Worker API

Base URL: `https://meteonerd-places.jivaanshyadav.workers.dev`

| Endpoint | Parameters | Description |
|----------|-----------|-------------|
| `/search` | `country` (ISO 2-letter), `q` (min 2 chars), `limit` (max 50) | Search places in a country |
| `/countries` | — | List all distinct country codes in the database |

Example:
```
GET /search?country=IN&q=Mumb&limit=50

{
  "results": [
    { "name": "Mumbai", "lat": 19.07283, "lon": 72.88261 },
    { "name": "Mumbai Suburban", "lat": 19.12636, "lon": 72.84897 },
    ...
  ]
}
```

---

## Running Locally

```bash
git clone https://github.com/Jivaansh-Yadav/MeteoNerd.git
cd MeteoNerd
npm install
npm run dev
```

Open `http://localhost:3000`.

No environment variables required — Open-Meteo is free and keyless. The places Worker is a public endpoint.

---

## Deployment

Deployed on **Cloudflare Pages** with the following build settings:

| Setting | Value |
|---------|-------|
| Build command | `npm run build && cp dist/client/_shell.html dist/client/index.html` |
| Build output directory | `dist/client` |
| Node.js version | 22 |

The `cp` step copies TanStack Start's prerendered `_shell.html` to `index.html` so Cloudflare Pages can serve it as the SPA entry point. The `_redirects` file routes all paths to `index.html`.

---

## Design

- **Light-first** with dark mode toggle
- **JetBrains Mono** for all data values and units
- **Inter** for labels, headings, UI chrome
- No background animations — the hero gradient is static CSS, set once on fetch
- No box shadows, border radius capped at 4px
- Condition-reactive hero gradients (clear day, rain, thunderstorm, snow, haze, night etc.)
- Category color-coded accordions with Lucide icons

---

## Data Sources & Credits

- Weather data — [Open-Meteo](https://open-meteo.com/) (free, open-source)
- Place names and coordinates — [GeoNames](https://www.geonames.org/) (CC BY 4.0)
- Icons — [Lucide](https://lucide.dev/)
