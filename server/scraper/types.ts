export type PlayerInfo = {
  name: string;
  licenseNumber: string;
  seriesScore: number[];
  total: number;
  numberOfSeries: number;
  points: number;
  gameRank: number;
  matchId: number;
};

export type MatchInfo = {
  matchId: number;
  round: number;
  date: string;
  home: string;
  homeScore: number;
  away: string;
  awayScore: number;
};

export type MatchRound = {};
