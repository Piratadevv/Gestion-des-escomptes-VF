# Banking Management System

A React TypeScript frontend with Express.js backend for managing banking discounts (escomptes) and refinancing operations with comprehensive logging.

## Quick start (exact commands)

**Prerequisites:** Node.js >=18, npm >=8

```bash
# Setup
git clone <repository-url>
cd Gestion-des-escomptes-VF-main
npm install

# Run (requires 2 terminals)
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
npm start

# Other commands
npm run build        # Production build
npm test            # Unit tests
npm run test:e2e    # E2E tests with Playwright
```

**Example .env:**
```env
PORT=3000
REACT_APP_API_URL=http://localhost:3001
LOG_LEVEL=info
NODE_ENV=development
```

## File map (top-level + important nested files)

- `server.js` — Express API server. Handles CRUD operations for escomptes/refinancements with in-memory storage.
  - CORS enabled, Winston logging integrated, serves on port 3001.
  - Data persists only during server runtime - restart clears all data.

- `src/` — React TypeScript frontend source.
  - Redux Toolkit for state, Tailwind for styling, React Router for navigation.
  - Hot reload enabled in development mode.

- `src/components/` — React components organized by feature.
  - `Escomptes/` for discount management, `Layout/` for header/sidebar, `UI/` for reusables.
  - Each component uses TypeScript interfaces and Tailwind classes.

- `src/store/` — Redux store configuration and slices.
  - Centralized state management with RTK Query for API calls.
  - Slices handle escomptes, refinancements, auth, and configuration state.

- `src/services/api/` — API client and endpoint definitions.
  - Axios-based client with error handling and request/response logging.
  - Separate files per feature (escomptes, refinancements, dashboard).

- `utils/logger.js` — Winston logging configuration.
  - Daily rotating files in `logs/` directory with different log levels.
  - Automatic log cleanup and structured JSON formatting.

- `tailwind.config.js` — Tailwind CSS configuration.
  - Custom color palette (primary, success, warning, danger) and form plugin.
  - Responsive breakpoints and utility class extensions.

- `package.json` — Dependencies and scripts.
  - React 18, Redux Toolkit, Express, Winston, Playwright for testing.
  - Scripts for dev, build, test, and deployment workflows.

## Deployment

**Build:** `npm run build` creates optimized static files in `build/` directory.

**Hosting:** Frontend works on Vercel/Netlify (static). Backend needs Node.js hosting (Heroku, DigitalOcean). Set `REACT_APP_API_URL` to production backend URL.

## Troubleshooting

- **Blank page/404:** Start backend server first with `node server.js`
- **Port 3000 in use:** Use `PORT=3002 npm start` or kill existing process
- **CORS errors:** Ensure backend runs on port 3001 and frontend on 3000

## Env vars table

| NAME | REQUIRED? | PURPOSE / EXAMPLE |
|------|-----------|-------------------|
| `PORT` | No | Frontend dev server port / `3000` |
| `REACT_APP_API_URL` | No | Backend API base URL / `http://localhost:3001` |
| `LOG_LEVEL` | No | Winston log level / `info` |
| `NODE_ENV` | No | Environment mode / `development` |
