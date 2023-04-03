import path from "path";
import express from "express";
import { scraper } from "./scraper/index";
import winston from "winston";
import expressWinston from "express-winston";
import { connect } from "mongoose";
import dotenv from "dotenv";
import { router } from "./routes";
import { MatchInfoModel } from "./db/models/match-info-model";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.NODE_DOCKER_PORT || '8080');

const connectToDatabase = async () => {
  const connectionString = `mongodb://mongodb:${process.env.MONGODB_DOCKER_PORT}/${process.env.MONGODB_DATABASE}`;
  await connect(connectionString, {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    authSource: "admin",
  });
};

app.use(router);

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, res) {
      return false;
    },
  })
);

app.use(express.static(path.join(__dirname + './../')))

app.get("/", (req, res) => {
  console.log("Received request for /, return ", path.join(__dirname + "/../index.html"));
  res.sendFile(path.join(__dirname + "/../index.html"));
});

app.get("/scrape", (req, res) => {
  res.send("Scraping...");
  scraper().then(() => {
    console.log("SCRAPING COMPLETE!");
  });
});

app.get("/ranking", (req, res) => {
  MatchInfoModel.find({}, (err, matchInfos) => {
    res.json(matchInfos);
  });
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log("Starting app...");
  await connectToDatabase();
  console.log("App is now running at http://localhost:%d", PORT);
});

// scraper();
