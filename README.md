# Bowling Team Scraper

A NextJS application that scrapes bowling match data from Swedish Bowling Federation (swebowl.se) for specific teams and stores the data in MongoDB.

## Features

- Scrapes match data for configured bowling teams
- Extracts detailed player statistics from each match
- Stores data in MongoDB for later analysis
- Prevents duplicate data by checking existing matches
- RESTful API endpoint to trigger scraping

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for MongoDB)
- Chrome/Chromium (Puppeteer will download it automatically)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the environment template and update if needed:

```bash
cp .env.template .env.local
```

The default configuration connects to MongoDB on localhost:27017. Adjust if your setup differs.

### 3. Start MongoDB

Start MongoDB using Docker Compose:

```bash
docker compose up -d
```

This will start MongoDB on port 27017 with the following credentials:
- Username: `root`
- Password: `123456`
- Database: `bowling`

### 4. Configure Teams (Optional)

Edit `lib/scraper/team-data.ts` to modify which teams are scraped:

```typescript
export const teamData: TeamInfo[] = [
  {
    teamId: '90611',
    teamName: 'A',
    divisionId: '4'
  },
  // Add more teams...
]
```

## Running the Application

### Development Mode

Start the NextJS development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

Build and run in production mode:

```bash
npm run build
npm start
```

## Usage

### Trigger Scraping via API

Send a POST or GET request to the scraping endpoint:

```bash
# Using curl
curl -X POST http://localhost:3000/api/scrape

# Or using GET
curl http://localhost:3000/api/scrape
```

The API will respond with:

```json
{
  "success": true,
  "message": "Successfully processed 15 matches",
  "matchesProcessed": 15,
  "errors": []
}
```

### What Gets Scraped

For each team configured in `team-data.ts`, the scraper will:

1. Navigate to the team's division page on swebowl.se
2. Find all matches where the team played
3. Visit each match detail page
4. Extract player statistics (only for your team's players):
   - Player name and license number
   - Series scores (4 series)
   - Total score
   - Game rank
5. Save match metadata:
   - Match ID, date, round
   - Home/away teams and scores
   - Division and season information

### Checking the Data

You can connect to MongoDB to view the scraped data:

```bash
# Connect to MongoDB container
docker exec -it fantasy-bowling-mongodb-1 mongosh -u root -p 123456 --authenticationDatabase admin

# Switch to bowling database
use bowling

# Query matches
db.matches.find().pretty()

# Count matches per team
db.matches.aggregate([
  { $group: { _id: "$teamName", count: { $sum: 1 } } }
])
```

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── scrape/
│   │       └── route.ts          # API endpoint for triggering scraping
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/
│   ├── db/
│   │   ├── connection.ts         # MongoDB connection handler
│   │   └── models.ts             # Mongoose schemas and models
│   └── scraper/
│       ├── index.ts              # Main scraper orchestration
│       ├── team-data.ts          # Team configuration
│       ├── extract-match-ids.ts  # Extract match IDs from division page
│       └── extract-player-data.ts # Extract player data from match page
├── docker-compose.yml            # MongoDB Docker configuration
├── next.config.js                # NextJS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Database Management

**Reset the database:**

```bash
# Stop MongoDB
docker compose down

# Remove data directory
rm -rf ./mongo

# Restart MongoDB
docker compose up -d
```

**View logs:**

```bash
# MongoDB logs
docker compose logs mongodb -f

# NextJS logs (when running in Docker)
docker compose logs app -f
```

## How It Works

### Scraping Flow

1. **Initialize**: Connect to MongoDB and launch Puppeteer browser
2. **For each team**:
   - Build URL with current year, team ID, division ID, and club ID
   - Navigate to the division page
   - Extract all match IDs where the team participated
   - Check database for existing matches to avoid duplicates
3. **For each new match**:
   - Navigate to match detail page
   - Extract match metadata (date, teams, scores)
   - Extract player statistics from the table
   - Determine if the team is home or away
   - Save only the team's player data (not opponent data)
   - Add small delay between requests to be respectful to the server

### Data Model

**Match Document:**
- Match metadata (ID, date, round, teams, scores)
- Team identification (which team this data is for)
- Division and season information
- Array of player statistics for the team

This structure allows querying match history for specific teams while keeping related player data together.

## Troubleshooting

### Puppeteer Issues

If Puppeteer fails to launch:

```bash
# Install Chrome/Chromium dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or let Puppeteer download Chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false npm install puppeteer
```

### MongoDB Connection Issues

- Ensure Docker is running: `docker ps`
- Check MongoDB logs: `docker compose logs mongodb`
- Verify connection string in `.env.local`

### Scraping Errors

- Check if swebowl.se structure has changed
- Verify team IDs and division IDs are correct
- Increase timeout values in `lib/scraper/index.ts` if pages load slowly

## Notes

- The scraper automatically uses the current year as the season
- Only new matches are processed; existing matches are skipped
- Player data is only saved for the configured team, not opponents
- A 500ms delay is added between match requests to avoid overwhelming the server
- The scraper timeout is set to 5 minutes (configurable in API route)

## License

Private project - not for redistribution
