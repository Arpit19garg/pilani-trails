# Pilani-Trails

**Pilani-Trails** — a playful, community-driven interactive map for Pilani town.  
Drop pins, share your fav hangouts, printing shops, cafes, and hidden gems. Great for freshers and returning students.

This repo is an **MVP web app** (React + Vite) designed to run as a static frontend:
- Uses the **Google Maps JS API** for the actual map (you must supply an API key).
- Data is stored in the browser (localStorage) for now and seeded with sample places.
- Later you can replace localStorage with Firebase / a backend to enable syncing across devices.

> Project created for Arpit (GitHub: `Arpit19garg`). Repo name: **pilani-trails**

## Features (MVP)
- Cartoonish/stylized Google Map (custom style)
- Add places by clicking on the map + fill form (name, category, description, image URL)
- Search, filter by category, bookmarks & upvotes (stored locally)
- Seeded with ~12 invented Pilani places to make it content-rich out of the box
- Pages: Map (home), Contribute, About, Admin (basic moderation)

## Tech
- React + Vite
- Google Maps JS API (styled)
- LocalStorage for persistence (easy to migrate later)
- Plain CSS (custom theme + playful vibe)

## Setup (local)
1. Clone / download this folder and open it in VS Code.
2. Copy `.env.example` to `.env.local` and add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run dev server:
   ```
   npm run dev
   ```
5. Open the URL shown by Vite (usually http://localhost:5173)

## Notes / Next steps
- For multi-device sync, connect Firestore / Supabase and move the places collection there.
- For mobile apps (Android/iOS), reuse this design and backend — make a React Native / Flutter app that talks to the same API.
- To deploy: run `npm run build` and host the `dist` directory (Netlify / Vercel / GitHub Pages).

## Developer tips
- Seed data is in `src/data/places.json`. On first run the app copies those into `localStorage`.
- Admin page is guarded by a simple pass (`VITE_ADMIN_PASS`) — change it in `.env.local`.
- The map style is in `src/lib/mapStyle.js` and is intentionally bright/cartoonish.

Have fun — drop a pin, flex your Pilani finds, and don't be sus 😉
