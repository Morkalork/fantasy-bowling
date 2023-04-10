import { Schema } from 'mongoose'
import { DIVISION, MatchInfo } from '../../scraper/types'
import { PlayerInfoSchema } from './player-info-schema'

export const MatchInfoSchema = new Schema<MatchInfo>({
  matchId: { type: Number, required: true, unique: true },
  round: { type: Number, required: true },
  date: { type: String, required: true },
  home: { type: String, required: true },
  homeScore: { type: Number, required: true },
  away: { type: String, required: true },
  awayScore: { type: Number, required: true },
  season: { type: Number, required: true },
  division: { type: Number, enum: DIVISION, required: true },
  players: [PlayerInfoSchema]
})
