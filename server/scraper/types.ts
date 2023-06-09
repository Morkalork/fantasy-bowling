export type PlayerInfo = {
  name: string
  licenseNumber: string
  seriesScore: number[]
  total: number
  numberOfSeries: number
  points: number
  gameRank: number
  isHome: boolean
}

export type MatchInfo = {
  division: DIVISION
  matchId: number
  round: number
  date: string
  home: string
  homeScore: number
  away: string
  awayScore: number
  season: number
  players: PlayerInfo[]
}

export type MatchRound = {}

export enum DIVISION {
  Elitserien = 1,
  NordAllsvenskan = 2,
  MellanAllsvenskan = 3,
  SydAllsvenskan = 4
}
