import type { MatchInfo, PlayerMatchInfo } from "./types";

/**
 * This function runs in the browser context to extract player data from match detail page
 */
export function extractPlayerData(teamName: string) {
  const matchInfo: MatchInfo = {
    matchId: 0,
    date: "",
    round: 0,
    isHomeGame: false,
    homeTeam: "",
    awayTeam: "",
    homeScore: 0,
    awayScore: 0,
    players: [],
  };

  // Extract match ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = urlParams.get("matchid");
  if (matchId) {
    matchInfo.matchId = parseInt(matchId, 10);
  }

  console.log(`Extracting player data for match ID: ${matchInfo.matchId}`);

  const homeTeamName =
    document.querySelector(".home-team .team-name")?.textContent?.trim() || "";
  const awayTeamName =
    document.querySelector(".away-team .team-name")?.textContent?.trim() || "";
  const isHomeTeam =
    homeTeamName === teamName ||
    homeTeamName.toLowerCase().includes(teamName.toLowerCase());
  console.log(
    `Home team: ${homeTeamName}, Away team: ${awayTeamName}, Is home team our team? ${isHomeTeam}`,
  );

  const allMatchDetails = document.querySelectorAll(
    ".matchdetail-player-score",
  );
  if (!allMatchDetails || allMatchDetails.length !== 2) {
    throw new Error(
      `Expected 2 player score tables, found ${allMatchDetails.length}`,
    );
  }

  const matchDetails = isHomeTeam ? allMatchDetails[0] : allMatchDetails[1];
  if (!matchDetails) {
    throw new Error(`Could not find player score table for our team`);
  }

  const rows = matchDetails.querySelectorAll(
    "table tbody tr:not(.Grid_Header)",
  );
  if (!rows || rows.length === 0) {
    throw new Error(`No player rows found in player score table`);
  }

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 7) {
      return; // Skip if not enough cells
    }

    const nameRaw = cells[0].textContent?.trim() || "";
    const nameMatch = nameRaw.match(/^(.+?)\s*\(([^)]+)\)$/);
    const name = nameMatch ? nameMatch[1].trim() : nameRaw;
    const licenseNumber = nameMatch ? nameMatch[2] : "";

    const series1 = parseInt(cells[1]?.textContent?.trim() || "0", 10);
    const series2 = parseInt(cells[2]?.textContent?.trim() || "0", 10);
    const series3 = parseInt(cells[3]?.textContent?.trim() || "0", 10);
    const series4 = parseInt(cells[4]?.textContent?.trim() || "0", 10);
    const totalScore = parseInt(cells[5]?.textContent?.trim() || "0", 10);
    const seriesCount = parseInt(cells[6]?.textContent?.trim() || "0", 10);
    const lanePoints = parseInt(cells[7]?.textContent?.trim() || "0", 10);
    const position = parseInt(cells[8]?.textContent?.trim() || "0", 10);

    matchInfo.players.push({
      name,
      licenseNumber,
      series1,
      series2,
      series3,
      series4,
      totalScore,
      seriesCount,
      lanePoints,
      position,
    });
  });

  return matchInfo;
}
