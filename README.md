# CGanga Frontend

A small React + Vite frontend for the CGanga visualization/upload tool.

This repository contains the UI for visualizing river/groundwater data and uploading new datasets (points and shapefiles). The UI is built with React + TypeScript, Vite, Tailwind, and Leaflet.

Backend
- The backend for this project lives here: https://github.com/viraj18p/CGanga_Backend
- The frontend expects the backend to expose a few API endpoints (listed below). The backend returns JSON status responses.

Quick start

Prerequisites
- Node 16+ (Node 18+ recommended)
- npm

Install dependencies

```bash
npm install
```

Run dev server

```bash
npm run dev
```

Open the app in your browser (usually at http://localhost:5173). The app has two main routes:
- `/` — main map/visualizer
- `/upload` — upload / admin page

Build for production

```bash
npm run build
npm run preview
```

Important local details

- The app uses a ThemeProvider that stores the preferred theme in localStorage under the key `vite-ui-theme`. The header contains a small button that cycles Light / Dark / Auto (system) modes.
- The upload page (`/upload`) contains four operations: Add Groundwater Point, Update Stream, Upload Stream Shapefile, Upload Basin Shapefile. Use the Upload page to POST/PUT to the backend endpoints listed below.

API endpoints (backend)

The frontend currently calls these backend endpoints (see backend repo for implementation details):

- POST /api/add_groundwater_point
  - params (JSON): { lat: number, lon: number, water_level: number, district?: string }
  - returns: JSON status message

- PUT /api/update_stream
  - params (JSON): { id: number, name: string, remarks?: string }
  - returns: JSON status message

- POST /api/upload_stream_shapefile
  - form-data: file (shapefile/zip)
  - returns: JSON status message

- POST /api/upload_basin_shapefile
  - form-data: file (shapefile/zip)
  - returns: JSON status message

If your backend runs on a different host/port, update the fetch URLs in `src/api.ts` or use a proxy configuration in Vite.

Styling & theme

Palette used (light → dark):
- #D9ED92
- #B5E48C
- #99D98C
- #76C893
- #52B69A
- #34A0A4 (primary)
- #168AAD
- #1A759F
- #1E6091
- #184E77

Notes:
- Primary actions and buttons use `#34A0A4` and darker hover `#1E6091` so they stand out in both light and dark themes.
- Cards are styled with a translucent/glassy look and dark-mode friendly backgrounds.

Developer notes / known issues

- `src/App.tsx` currently contains a temporary ESLint disable for some `any` usage and empty-catch blocks; this keeps edits small but should be tightened in a follow-up PR (fix types and avoid empty catches).
- Map tiles use OpenStreetMap by default. If you want dark tiles when in dark mode, we can switch tile providers based on theme.
- If the UI looks off after CSS edits, try a hard refresh (Ctrl+Shift+R) to clear cached styles.

Contributing

If you'd like changes (theme tweaks, extract colors to CSS variables, dark map tiles, better types), open an issue or PR — I'm happy to help implement them.

