# max-site

Fun, stylish site by Max to showcase tools and games. Built with React + Vite, deployed on Firebase Hosting.

## Stack
- React 19, React Router 7
- Vite (+ @vitejs/plugin-react)
- ESLint 9

## Routes
- `/` Home
- `/games` Games
- `/tools` Tools (List Tool: sort + diff)
- `/about` About
- `/projects/physics` PhysicsSandbox (canvas)
- `/projects/maze` MazeGame (canvas)
- `/projects/list-tool` List Tool (compare/sort lists)

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy (Firebase Hosting)
- Ensure a fresh build: `npm run build`
- Deploy: `firebase deploy`

Firebase config expects `public: dist` and SPA rewrite to `/index.html`.

## Project Structure
- `src/components/` — app components (e.g., `Navbar.jsx`, `navbar.css`)
- `src/pages/` — route pages (each page in its own folder)
- `src/projects/` — game/project implementations (canvas + logic + CSS)
- `src/styles/` — global CSS
  - `base.css` (defaults), `layout.css` (containers/hero), `components.css` (UI primitives), `typography.css` (text utilities)

Conventions: keep page/game code compartmentalized; prefer shared classes from `src/styles` before adding new CSS; avoid comments unless they add meaningful, non-obvious context.
