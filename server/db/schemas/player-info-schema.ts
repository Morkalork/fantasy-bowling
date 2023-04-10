import { Schema } from 'mongoose'
import type { PlayerInfo } from '../../scraper/types'

export const PlayerInfoSchema = new Schema<PlayerInfo>({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  seriesScore: { type: [Number], required: true },
  total: { type: Number, required: true },
  numberOfSeries: { type: Number, required: true },
  points: { type: Number, required: true },
  gameRank: { type: Number, required: true },
  isHome: { type: Boolean, required: true }
})
