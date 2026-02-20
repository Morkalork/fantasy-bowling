export type PlayerMatchInfo = {
  name: string;
  licenseNumber: string;
  series1: number;
  series2: number;
  series3: number;
  series4: number;
  totalScore: number;
  seriesCount: number;
  lanePoints: number;
  position: number;
};

export type ApiMatchHeadInfo = {
  dayOfWeek: string;
  matchId: number;
  matchHomeTeamId: number;
  matchHomeClubId: number;
  matchAwayClubId: number;
  matchHomeTeamName: string;
  matchHomeTeamAlias: string;
  matchAwayTeamId: number;
  matchAwayTeamName: string;
  matchAwayTeamAlias: string;
  matchDate: string;
  matchDivisionId: number;
  divisionRegion: number;
  matchLeagueId: number;
  matchLevelId: number;
  matchDivisionName: string;
  matchHallId: number;
  matchHallName: string;
  matchRoundId: number;
  matchNbrOfLanes: number;
  matchNbrOfPlayers: number;
  matchFinished: boolean;
  matchTime: number;
  matchHomeTeamScore: number;
  matchAwayTeamScore: number;
  matchHomeTeamResult: number;
  matchAwayTeamResult: number;
  matchSeason: number;
  matchHomeTeamVsAwayTeam: string;
  matchTeams: string;
  matchDayFormatted: string;
};

export type ApiPlayerMatchResult = {
  player: string;
  licNbr: string;
  homeOrAwayTeam: string;
  result1: number;
  result2: number;
  result3: number;
  result4: number;
  hcp: number;
  totalResultWithoutHcp: number;
  totalSeries: number;
  lanePoint: number;
  laneRankPoints: number;
  place: number;
  totalResult: number;
  rankPoints: number;
  totalPoints: number;
};

export type ApiPlayerMatchResponseData = {
  playerListHome: ApiPlayerMatchResult[];
  playerListAway: ApiPlayerMatchResult[];
};

export type MatchInfo = {
  matchId: number;
  date: string;
  round: number;
  isHomeGame: boolean;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  players: Array<PlayerMatchInfo>;
};
