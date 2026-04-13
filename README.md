# CGanga Frontend

Frontend application for CGanga data visualization, admin data operations, and basic user/account workflows.

## What this app does

- Auth flow: login, register, email verification
- Protected dashboard with Leaflet map visualization
- Layer toggling and refresh/export actions
- Admin-only upload/update tools for groundwater and shapefile data
- Profile page, gallery view, and logs view
- Light/dark/system theme toggle

## Tech stack

- React 19 + TypeScript
- Vite 7
- React Router 7
- Tailwind CSS 4
- Leaflet
- Axios + Fetch APIs

## Backend dependency

This frontend expects a separate backend service. Related backend repo:

- https://github.com/viraj18p/CGanga_Backend

Current frontend API calls are hardcoded to:

- `http://127.0.0.1:8000`

If your backend runs elsewhere, update URLs in:

- `src/api.ts`
- `src/pages/Upload.tsx`
- `src/pages/Logs.tsx`

## Prerequisites

- Node.js 18+ recommended
- npm

## Local setup

```bash
npm install
npm run dev
```

Vite dev server runs at `http://localhost:5173` by default.

## Available scripts

```bash
npm run dev      # Start dev server
npm run build    # Type-check + production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Routes

Public:

- `/login`
- `/register`
- `/verify/:token`

Protected (requires token):

- `/dashboard`
- `/profile`
- `/ViewPage`

Admin-only (requires admin role):

- `/upload`
- `/UpdatePage`
- `/logs`

Unknown routes redirect to `/dashboard` (if logged in) or `/login`.

## Key API endpoints used by the frontend

- `POST /api/add_groundwater_point`
- `PUT /api/update_stream`
- `POST /api/upload_stream_shapefile`
- `POST /api/upload_basin_shapefile`
- `GET /api/ground_water_points`
- `GET /api/hindon_stream_network`
- `GET /api/hindon_basin`
- `GET /logs`

## Auth/role handling

- Login state is based on `token` in `localStorage`.
- Role checks use `role` in `localStorage`, or role fields in JWT payload.
- Admin access accepts roles like `admin`, `administrator`, or `superadmin`.

## Notes

- The app currently has pre-existing lint/type issues in source files unrelated to this README refresh.
- Map tiles use OpenStreetMap.
