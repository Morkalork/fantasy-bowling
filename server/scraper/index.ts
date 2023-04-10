import puppeteer from 'puppeteer'
import { MatchInfoModel } from '../db/models/match-info-model'
import { PlayerInfoModel } from '../db/models/player-info-model'
import { evaluateMatchIds } from './evaluate-match-ids'
import { evaluatePlayerInfos } from './evaluate-player-infos'
import { PlayerInfo, MatchInfo, DIVISION } from './types'

const SEASON = 2022

const getUrl = (season: number, division: DIVISION) =>
  `https://bits.swebowl.se/seriespel?seasonId=${season}&divisionId=${division}&showAllDivisionMatches=true`

const getGameInfoUrl = (gameInfoId: number) =>
  `https://bits.swebowl.se/match-detail?matchid=${gameInfoId}`

export const scraper = async () => {
  console.log('Launching scraper!')

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process'
    ]
  })
  const page = await browser.newPage()

  /**
    * USE THIS DURING DEVELOPMENT TO INTERCEPT REQUESTS
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      request.resourceType() === "xhr" &&
      request.url().startsWith("https://api.swebowl.se/api/v1/Match")
    ) {
      // TODO: Fix/remove this once the rest is fixed
      const newUrl = request.url().replace("seasonId=2022", "seasonId=2021");
      request.continue({
        url: newUrl,
      });
    } else {
      request.continue();
    }
  });
   */

  page.on('console', (message) => {
    if (message.text().startsWith('JQMIGRATE') || message.type() !== 'log') {
      return
    }
    console.log(message.text())
  })

  await scrapeDivision(page, DIVISION.Elitserien)
  await scrapeDivision(page, DIVISION.NordAllsvenskan)
  await scrapeDivision(page, DIVISION.MellanAllsvenskan)
  await scrapeDivision(page, DIVISION.SydAllsvenskan)

  console.log('Scraper done...')

  browser.close()
}

async function scrapeDivision(page: puppeteer.Page, division: DIVISION) {
  console.log(`Scraping ${division} for season ${SEASON}`)
  const url = getUrl(SEASON, division)
  await page.goto(url)
  await page.waitForSelector('.k-grid-content table tbody tr')

  // await page.exposeFunction('evaluatePlayerInfos', evaluatePlayerInfos)

  const existingIds: number[] = (await MatchInfoModel.find({}).select('matchId')).map(
    ({ matchId }) => matchId
  )
  const matchIds = (await page.evaluate(evaluateMatchIds)).filter(
    (matchId) => !existingIds.includes(matchId)
  )

  console.log(
    `Existing id count: ${existingIds.length}, matchId's to go through: ${matchIds.length}`
  )

  const matchInfos: MatchInfo[] = []
  for (let i = 0; i < matchIds.length; i++) {
    const matchId = matchIds[i]
    const gameInfoUrl = getGameInfoUrl(matchId)
    await page.goto(gameInfoUrl)
    await page.waitForSelector('.matchdetail-player-scores table tr:not(.Grid_Header)')

    // Passing values to the evaluated function: https://stackoverflow.com/a/46098448/844932
    const { matchInfo } = await page.evaluate(
      evaluatePlayerInfos,
      division,
      SEASON
    )

    matchInfos.push(matchInfo)
    console.log(`evaluatePlayerInfos: (${matchId}) ${Math.floor((i / matchIds.length) * 100)}%`)
  }

  const matchInfoModels = matchInfos.map((matchInfo) => {
    return new MatchInfoModel(matchInfo)
  })

  await MatchInfoModel.insertMany(matchInfoModels)
}
