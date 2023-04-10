import path from 'path'
import express, { Response } from 'express'
import { scraper } from './scraper/index'
import winston from 'winston'
import expressWinston from 'express-winston'
import { Callback, connect } from 'mongoose'
import dotenv from 'dotenv'
import { router } from './routes'
import { MatchInfoModel } from './db/models/match-info-model'
import { PlayerInfoModel } from './db/models/player-info-model'
import { PlayerInfo } from './scraper/types'

dotenv.config()
const isDev = !!process.env.IS_DEV
const isLocal = !!process.env.IS_LOCAL

const app = express()
const PORT = parseInt(
  (isDev ? process.env.NODE_LOCAL_PORT : process.env.NODE_DOCKER_PORT) || '8080'
)

const connectToDatabase = async () => {
  const mongoPort = isLocal ? process.env.MONGODB_LOCAL_PORT : process.env.MONGODB_DOCKER_PORT
  const connectionString = `mongodb://${process.env.MONGODB_DOCKER_LOCATION}:${mongoPort}/${process.env.MONGODB_DATABASE}`
  console.log(
    `Connection string: "${connectionString}", user: ${process.env.MONGODB_USER}, pass: ${process.env.MONGODB_PASSWORD}`
  )
  try {
    await connect(connectionString, {
      user: process.env.MONGODB_USER,
      pass: process.env.MONGODB_PASSWORD,
      authSource: 'admin'
    })
    console.log('Connection to database established.')
  } catch (e) {
    console.error('Failed to connect to database: ', e)
  }
}

app.use(router)

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, res) {
      return false
    }
  })
)

app.use(express.static(path.join(__dirname + './../')))

app.get('/', (req, res) => {
  console.log('Received request for /, return ', path.join(__dirname + '/../index.html'))
  res.sendFile(path.join(__dirname + '/../index.html'))
})

app.get('/scrape', (req, res) => {
  console.log('Starting craping...')
  res.send('Scraping...')
  scraper().then(() => {
    console.log('SCRAPING COMPLETE 2!')
  })
})

app.get('/ranking', (req, res) => {
  console.log('Get ranking!')
  MatchInfoModel.find({}, (err, matchInfos) => {
    res.json(matchInfos)
  })
})

app.get('/player/search/:name', (req, res) => {
  const name = req.params.name
  const searchRegex = new RegExp(`.*${name}.*`, 'gi')
  runQueryWithErrorHandling(async () => {
    const result: PlayerInfo[] = await MatchInfoModel.aggregate()
      .unwind('$players')
      .match({ 'players.name': searchRegex })
      .group({_id: { licenseNumber: '$players.licenseNumber', name: '$players.name' }})
      .project({ licenseNumber: '$_id.licenseNumber', name: '$_id.name' })
    res.json(result)
  }, 'get player')
})

app.get('/player/:licenseNumber', (req, res) => {
  const licenseNumber = req.params.licenseNumber
  runQueryWithErrorHandling(async () => {
    const result: PlayerInfo[] = await MatchInfoModel.aggregate()
      .unwind('$players')
      .match({ 'players.licenseNumber': licenseNumber })
    res.json(result)
  }, 'get player')
})

app.get('/players', (req, res) => {
  runQueryWithErrorHandling(async () => {
    const result: PlayerInfo[] = await MatchInfoModel.aggregate([
      { $unwind: '$players' },
      { $group: { _id: { licenseNumber: '$players.licenseNumber', name: '$players.name' } } },
      { $project: { licenseNumber: '$_id.licenseNumber', name: '$_id.name' } }
    ])
    const players = result.map(({ licenseNumber, name }) => ({ licenseNumber, name }))
    res.json(players)
  }, 'get players')
})

app.listen(PORT, '0.0.0.0', async () => {
  console.log('Starting app on port ', PORT)
  await connectToDatabase()
  console.log('App is now running at http://localhost:%d', PORT)
})

const runQueryWithErrorHandling = async (func: () => Promise<void>, actionDescription: string) => {
  try {
    await func()
  } catch (error) {
    console.error(`Failed to '${actionDescription}`)
    console.error(error)
    throw error
  }
}
