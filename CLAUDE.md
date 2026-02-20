# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fantasy Bowling is a full-stack application that scrapes bowling match data from Swedish Bowling Federation (swebowl.se) and provides a web interface for viewing player statistics and rankings. The application consists of:

- **Frontend**: Vue 3 SPA with TypeScript, Pinia for state management, Vue Router
- **Backend**: Express.js server with TypeScript that serves the frontend and provides REST APIs
- **Scraper**: Puppeteer-based web scraper that extracts match and player data
- **Database**: MongoDB for storing match and player information

## Development Commands

### Frontend Development
```bash
npm run dev                 # Start Vite dev server (frontend only)
npm run build              # Build frontend (runs type-check + build-only)
npm run build-only         # Build frontend without type checking
npm run type-check         # Run Vue TypeScript compiler without emitting files
npm run lint               # Run ESLint with auto-fix
npm run format             # Format code with Prettier
npm test:unit              # Run Vitest unit tests
```

### Backend Development
```bash
npm run build-server       # Compile server TypeScript to dist/server/
npm run dev-server         # Run compiled server (requires IS_DEV=true IS_LOCAL=true env vars)
npm run build-all          # Build both frontend and backend
```

### Docker Development Workflow

The recommended development workflow uses Docker for MongoDB only:

1. Start MongoDB container:
   ```bash
   docker compose up mongodb
   ```

2. Build and run the server locally:
   ```bash
   npm run build-server
   npm run dev-server
   ```

3. Start the frontend dev server:
   ```bash
   npm run dev
   ```

To run the full stack in Docker (production-like):
```bash
npm run build-all
docker compose up
```

### Database Operations

**Reset database**: Stop containers, delete `mongo/` directory, then restart:
```bash
docker compose down
rm -rf mongo/
docker compose up
```

**Connect to MongoDB**: Open Docker terminal and connect:
```bash
mongosh fb -u fbuser -p secret
use fb
db.matchinfos.find()  # Query matches
```

## Architecture

### Data Flow

1. **Scraping**: The `/scrape` endpoint triggers Puppeteer to scrape swebowl.se
   - Scrapes multiple divisions: Elitserien, Nord/Mellan/Syd Allsvenskan
   - Extracts match IDs from division pages, then visits each match detail page
   - Parses player statistics from match detail pages
   - Stores data in MongoDB via Mongoose models

2. **API Layer**: Express routes in `server/routes.ts` and `server/index.ts`
   - `/api/players` - Aggregates player rankings across rounds
   - `/players` - Returns all unique players (license number + name)
   - `/player/search/:name` - Regex search for players by name
   - `/player/:licenseNumber` - Get all match data for a specific player
   - `/ranking` - Get all match information

3. **Frontend**: Vue 3 SPA that consumes the API
   - Pinia stores for state management (`stores/players.ts`, `stores/matches.ts`)
   - Vue Router for navigation
   - Views: `HomeView.vue`, `TeamView.vue`

### Key Technical Details

- **Mongoose Models**: Located in `server/db/models/`
  - `MatchInfoModel` - Stores match metadata + embedded player stats
  - `PlayerInfoModel` - Stores individual player statistics per game

- **Schemas**: Located in `server/db/schemas/`
  - `match-info-schema.ts` - Defines match structure with embedded players array
  - `player-info-schema.ts` - Defines player statistics structure

- **Scraper Implementation**: `server/scraper/index.ts`
  - Uses Puppeteer with Chrome in Docker (`executablePath: '/usr/bin/google-chrome'`)
  - `evaluate-match-ids.ts` - Extracts match IDs from division pages (runs in browser context)
  - `evaluate-player-infos.ts` - Extracts player data from match detail pages (runs in browser context)
  - Checks existing match IDs before scraping to avoid duplicates

- **Environment Configuration**: Copy `.env.template` to `.env`
  - `IS_DEV` and `IS_LOCAL` control connection strings
  - Local dev connects to `localhost` MongoDB port
  - Docker dev connects to `mongodb` service hostname

### TypeScript Configuration

The project uses multiple TypeScript configurations:
- `tsconfig.app.json` - Frontend application code
- `tsconfig.server.json` - Backend server code (compiles to `dist/server/`)
- `tsconfig.node.json` - Build tooling (Vite config, etc.)
- `tsconfig.vitest.json` - Test configuration

### Code style
- Never use one-liners, such as if(true) return;

### Vite Alias

Frontend code can use `@/` alias to reference `src/` directory (configured in `vite.config.ts`).

## Important Notes

- The server must be built before running with `npm run build-server`
- The scraper is configured for 2022 season data (SEASON constant in `server/scraper/index.ts`)
- Puppeteer requires specific Chrome args for Docker environments (no-sandbox, disable-setuid-sandbox, etc.)
- Match data includes embedded player statistics rather than separate collections for performance
