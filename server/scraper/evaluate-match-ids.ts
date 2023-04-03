export const evaluateMatchIds = (): Promise<number[]> => {
  const rows = document.querySelectorAll(".k-grid-content table tbody tr");
  const matchIds = new Set<number>();
  rows.forEach((row, key) => {
    if (row.getAttribute("data-uid")) {
      const hasContent = !!row.querySelector("td:nth-child(4) span")
        ?.textContent;
      if (hasContent) {
        const gameInfoId = row.querySelector(
          "td:nth-child(9) span"
        )?.textContent;
        if (gameInfoId) {
          matchIds.add(parseInt(gameInfoId));
        }
      }
    }
    console.log(`evaluateMatchIds: ${Math.floor((key / rows.length) * 100)}%`);
  });

  return Promise.resolve([...matchIds]);
};
