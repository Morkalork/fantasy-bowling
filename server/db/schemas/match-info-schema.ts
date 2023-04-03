import { Schema } from "mongoose";
import type { MatchInfo } from "../../scraper/types";

export const MatchInfoSchema = new Schema<MatchInfo>({
  matchId: { type: Number, required: true, unique: true },
  round: { type: Number, required: true },
  date: { type: String, required: true },
  home: { type: String, required: true },
  homeScore: { type: Number, required: true },
  away: { type: String, required: true },
  awayScore: { type: Number, required: true },
});
