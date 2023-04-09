import path from 'path'
import express from 'express'
import { scraper } from './scraper/index'
import winston from 'winston'
import expressWinston from 'express-winston'
import { connect } from 'mongoose'
import dotenv from 'dotenv'
import { router } from './routes'
import { MatchInfoModel } from './db/models/match-info-model'

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
    console.log('SCRAPING COMPLETE!')
  })
})

app.get('/ranking', (req, res) => {
  console.log('Get ranking!')
  MatchInfoModel.find({}, (err, matchInfos) => {
    res.json(matchInfos)
  })
})

app.get('/players', (req, res) => {
  console.log('GET PLAYER!')
})

app.listen(PORT, '0.0.0.0', async () => {
  console.log('Starting app on port ', PORT)
  await connectToDatabase()
  console.log('App is now running at http://localhost:%d', PORT)
})

// scraper();
