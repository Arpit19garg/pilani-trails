# Pilani-Trails

**Pilani-Trails** — a playful, community-driven interactive map for Pilani town.  
Drop pins, share your fav hangouts, printing shops, cafes, and hidden gems. Great for freshers and returning students.

This repo is an **MVP web app** (React + Vite) designed to run as a static frontend:

- Uses **Leaflet + OpenStreetMap** for the actual map — completely **FREE** with no API keys needed!
- Data is stored in the browser (localStorage) for now and seeded with sample places.
- Later you can replace localStorage with Firebase / a backend to enable syncing across devices.

> Project created for Arpit (GitHub: `Arpit19garg`). Repo name: **pilani-trails**

## Features (MVP)

- Interactive OpenStreetMap with Leaflet (free, no API key required)
- Add places by clicking on the map + fill form (name, category, description, image URL)
- Search, filter by category, bookmarks & upvotes (stored locally)
- Seeded with ~12 invented Pilani places to make it content-rich out of the box
- Pages: Map (home), Contribute, About, Admin (basic moderation)

## Tech

- React + Vite
- **Leaflet + OpenStreetMap** (free tiles, no API key!)
- react-leaflet (React components for Leaflet)
- LocalStorage for persistence (easy to migrate later)
- Plain CSS (custom theme + playful vibe)

## Setup (local)

1. Clone / download this folder and open it in VS Code.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Open the URL shown by Vite (usually http://localhost:5173)

**Note:** No API keys needed! We use free OpenStreetMap tiles via public tile servers.

## Notes / Next steps

- For multi-device sync, connect Firestore / Supabase and move the places collection there.
- For mobile apps (Android/iOS), reuse this design and backend — make a React Native / Flutter app that talks to the same API.
- To deploy: run `npm run build` and host the `dist` directory (Netlify / Vercel / GitHub Pages).

## Developer tips

- Seed data is in `src/data/places.json`. On first run the app copies those into `localStorage`.
- Admin page is guarded by a simple pass (`VITE_ADMIN_PASS`) — change it in `.env` or `.env.local`.
- The map now uses Leaflet with free OpenStreetMap tiles — no custom styling files needed!
- Leaflet CSS is automatically imported from `node_modules`

## Migration from Google Maps

This project has been migrated from Google Maps API to Leaflet + OpenStreetMap to:
- ✅ **Eliminate API key requirements** (100% free)
- ✅ **Remove billing concerns** (no usage limits)
- ✅ **Use open-source mapping** (community-driven OSM data)
- ✅ **Maintain all functionality** (markers, popups, click events)

Have fun — drop a pin, flex your Pilani finds, and don't be sus 😉
