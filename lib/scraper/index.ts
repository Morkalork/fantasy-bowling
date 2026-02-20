import puppeteer, { Browser, Page } from "puppeteer";
import { connectToDatabase } from "@/lib/db/connection";
import { Match } from "@/lib/db/models";
import { teamData, CLUB_ID, SEASON } from "./team-data";
import { extractMatchIds } from "./extract-match-ids";
import type { ApiMatchHeadInfo, ApiPlayerMatchResponseData } from "./types";

interface ScraperResult {
  success: boolean;
  message: string;
  matchesProcessed: number;
  errors: string[];
}

export async function runScraper(
  onLog?: (msg: string) => void,
): Promise<ScraperResult> {
  const log = (msg: string) => {
    console.log(msg);
    onLog?.(msg);
  };
  let matchesProcessed = 0;

  log("Starting scraper...");

  // Connect to database
  try {
    await connectToDatabase();
    log("Connected to database");
  } catch (error) {
    const message = `Failed to connect to database: ${error}`;
    log(message);
    return { success: false, message, matchesProcessed: 0, errors: [message] };
  }

  let browser: Browser | null = null;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    // page.on("console", (msg) => log(`[browser] ${msg.text()}`));
    await page.setViewport({ width: 1920, height: 1080 });

    log(`Scraping season ${SEASON}`);

    // Process each team
    for (const team of teamData) {
      log(`Processing team: ${team.teamName} (${team.teamId})`);
      const teamMatches = await scrapeTeam(page, team, log);
      matchesProcessed += teamMatches;
    }

    await browser.close();

    log(`Scraping complete. Processed ${matchesProcessed} matches.`);

    return {
      success: true,
      message: `Successfully processed ${matchesProcessed} matches`,
      matchesProcessed,
      errors: [],
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    const message = `Scraper error: ${error}`;
    log(message);
    return {
      success: false,
      message,
      matchesProcessed,
      errors: [message],
    };
  }
}

async function scrapeTeam(
  page: Page,
  team: { teamId: string; teamName: string; divisionId: string },
  log: (msg: string) => void,
): Promise<number> {
  const url = `https://bits.swebowl.se/seriespel?seasonId=${SEASON}&clubId=${CLUB_ID}&teamId=${team.teamId}&divisionId=${team.divisionId}&showAllDivisionMatches=true&showTeamDetails=true`;

  log(`Navigating to: ${url}`);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  // Wait for the match table to load
  try {
    await page.waitForSelector(
      '#divisionMatchesDesktop table[role="grid"] tr[data-uid]',
      { timeout: 10000 },
    );
  } catch (error) {
    log("No matches found for this team or table did not load");
    return 0;
  }

  // Find matching rows for this team
  const matchRows = await page.evaluate(extractMatchIds, team.teamName);
  log(`Found ${matchRows.length} matches for team ${team.teamName}`);

  if (matchRows.length === 0) {
    return 0;
  }

  let processedCount = 0;

  // Process each match by clicking its Matchfakta link
  for (let i = 0; i < matchRows.length; i++) {
    const { uid, round } = matchRows[i];
    log(`Processing match ${i + 1}/${matchRows.length} (row ${uid})`);

    // Set up promises to capture API responses before clicking
    const headInfoPromise = interceptResponse<ApiMatchHeadInfo>(
      page,
      "matchResult/GetHeadInfo",
    );
    const matchResultPromise = interceptResponse<ApiPlayerMatchResponseData>(
      page,
      "matchResult/GetMatchResults",
    );

    // Click the Matchfakta link to trigger both API calls
    const linkSelector = `tr[data-uid="${uid}"] td:nth-child(4) a`;
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
      page.click(linkSelector),
    ]);

    // Await both intercepted responses
    const headInfo = await headInfoPromise;
    const matchResults = await matchResultPromise;

    const matchId = headInfo.matchId;
    const isHomeGame = headInfo.matchHomeTeamId.toString() === team.teamId;

    // Check if this match already exists in database
    const exists = await Match.exists({ matchId, teamId: team.teamId });
    if (exists) {
      log(`Match ${matchId} already in database, skipping`);
      await page.goBack({ waitUntil: "networkidle2", timeout: 30000 });
      continue;
    }

    // Map API player data to our schema
    const apiPlayers = isHomeGame
      ? matchResults.playerListHome
      : matchResults.playerListAway;

    const players = apiPlayers.map((p) => {
      const nameMatch = p.player.match(/^(.+?)\s*\(([^)]+)\)$/);
      return {
        name: nameMatch ? nameMatch[1].trim() : p.player,
        licenseNumber: p.licNbr,
        series1: p.result1,
        series2: p.result2,
        series3: p.result3,
        series4: p.result4,
        totalScore: p.totalResultWithoutHcp,
        seriesCount: p.totalSeries,
        lanePoints: p.lanePoint,
        position: p.place,
      };
    });

    const matchDoc = new Match({
      matchId,
      teamId: team.teamId,
      teamName: team.teamName,
      date: headInfo.matchDate,
      round: round || headInfo.matchRoundId,
      homeTeam: headInfo.matchHomeTeamName,
      awayTeam: headInfo.matchAwayTeamName,
      homeScore: headInfo.matchHomeTeamScore,
      awayScore: headInfo.matchAwayTeamScore,
      isHomeGame,
      divisionId: headInfo.matchDivisionId,
      divisionName: headInfo.matchDivisionName,
      season: headInfo.matchSeason,
      headInfo,
      players,
    });

    await matchDoc.save();
    processedCount++;
    log(
      `Saved match ${matchId}: ${headInfo.matchHomeTeamName} vs ${headInfo.matchAwayTeamName} (${players.length} players)`,
    );

    // Navigate back to the division page
    await page.goBack({ waitUntil: "networkidle2", timeout: 30000 });

    // Add small delay to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return processedCount;
}

function interceptResponse<T>(page: Page, urlFragment: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`${urlFragment} response timed out`)),
      30000,
    );
    const handler = async (response: import("puppeteer").HTTPResponse) => {
      if (response.url().includes(urlFragment)) {
        clearTimeout(timeout);
        page.off("response", handler);
        try {
          const json = JSON.parse(await response.text());
          resolve(json);
        } catch (error) {
          reject(
            new Error(`Failed to parse ${urlFragment} response: ${error}`),
          );
        }
      }
    };
    page.on("response", handler);
  });
}
