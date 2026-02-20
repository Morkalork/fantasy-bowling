/**
 * This function runs in the browser context to find match rows for a given team.
 *
 * Page structure:
 * - #divisionMatchesDesktop contains a table[role="grid"]
 * - Each tr[data-uid] is a match row
 * - The 5th td (index 4) has two a.details-link elements with the team names
 * - The 4th td (index 3) has the "Matchfakta" link (no href, navigates via click handler)
 * - Not all matches have been played, so some rows may lack a Matchfakta link
 *
 * Returns data-uid values and round numbers so the caller can click each link.
 */
export function extractMatchIds(
  teamName: string,
): Array<{ uid: string; round: number }> {
  const results: Array<{ uid: string; round: number }> = [];

  const rows = document.querySelectorAll(
    '#divisionMatchesDesktop table[role="grid"] tr[data-uid]',
  );

  console.log(
    `Extracting match rows for team: ${teamName}, found ${rows.length} rows`,
  );

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 5) return;

    // 5th td (index 4) contains two a.details-link with team names
    const teamLinks = cells[4].querySelectorAll("a.details-link");
    const isTeamMatch = Array.from(teamLinks).some((link) => {
      const text = link.textContent?.trim() || "";
      return text === teamName;
    });

    if (!isTeamMatch) {
      return;
    }

    // 4th td (index 3) contains the "Matchfakta" link
    const matchLink = cells[3].querySelector("a");
    if (!matchLink) {
      return; // Match not yet played
    }

    const uid = row.getAttribute("data-uid") || "";
    if (!uid) {
      return;
    }

    // Round number is typically in the 1st td
    let round = 0;
    const roundText = cells[0]?.textContent?.trim() || "";
    const roundNum = parseInt(roundText, 10);
    if (!isNaN(roundNum)) {
      round = roundNum;
    }

    results.push({ uid, round });
  });

  return results;
}
