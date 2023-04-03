import express from "express";
import { MatchInfoModel } from "./db/models/match-info-model";
import { PlayerInfoModel } from "./db/models/player-info-model";
import type { MatchInfo } from "./scraper/types";

const r = express.Router();

r.get("/api/players", async (request, response) => {
  const numberOfAvailableRoundsResult: MatchInfo[] = await MatchInfoModel.find()
    .sort({
      round: -1,
    })
    .limit(1)
    .select("round");
  const numberOfAvailableRounds = numberOfAvailableRoundsResult[0].round;

  for (let i = 0; i < numberOfAvailableRounds; i++) {}

  const topRankingPlayers = await PlayerInfoModel.aggregate()
    .match({ gameRank: 1 })
    .group({
      _id: "$name",
      numberOfTopRanks: { $sum: 1 },
    })
    .sort("numberOfTopRanks");
  const bottomRankingPlayers = await PlayerInfoModel.aggregate()
    .match({ gameRank: 10 })
    .group({
      _id: "$name",
      numberOfBottomRanks: { $sum: 1 },
    })
    .sort("numberOfBottomRanks");

  response.json({
    numberOfAvailableRounds,
    topRankingPlayers,
    bottomRankingPlayers,
  });
});

export const router = r;
