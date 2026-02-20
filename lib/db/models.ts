import mongoose, { Schema, Model } from 'mongoose'
import type { ApiMatchHeadInfo } from '@/lib/scraper/types'

// Player statistics interface
export interface IPlayerStats {
  name: string
  licenseNumber: string
  series1: number
  series2: number
  series3: number
  series4: number
  totalScore: number
  seriesCount: number
  lanePoints: number
  position: number
}

// Match information interface
export interface IMatch {
  matchId: number
  teamId: string
  teamName: string
  date: string
  round: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  isHomeGame: boolean
  divisionId: number
  divisionName: string
  season: number
  headInfo: ApiMatchHeadInfo
  players: IPlayerStats[]
  createdAt: Date
  updatedAt: Date
}

// Player stats schema
const PlayerStatsSchema = new Schema<IPlayerStats>({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  series1: { type: Number, required: true },
  series2: { type: Number, required: true },
  series3: { type: Number, required: true },
  series4: { type: Number, required: true },
  totalScore: { type: Number, required: true },
  seriesCount: { type: Number, required: true },
  lanePoints: { type: Number, required: true },
  position: { type: Number, required: true }
}, { _id: false })

// Match schema
const MatchSchema = new Schema<IMatch>({
  matchId: { type: Number, required: true, unique: true },
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  date: { type: String, required: true },
  round: { type: Number, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  homeScore: { type: Number, required: true },
  awayScore: { type: Number, required: true },
  isHomeGame: { type: Boolean, required: true },
  divisionId: { type: Number, required: true },
  divisionName: { type: String, required: true },
  season: { type: Number, required: true },
  headInfo: { type: Schema.Types.Mixed, required: true },
  players: [PlayerStatsSchema]
}, {
  timestamps: true
})

// Create index for efficient queries
MatchSchema.index({ matchId: 1, teamId: 1 })
MatchSchema.index({ teamId: 1, season: 1 })

// Export model (handle Next.js hot reload)
export const Match: Model<IMatch> = mongoose.models.Match as Model<IMatch>
  || mongoose.model<IMatch>('Match', MatchSchema)
