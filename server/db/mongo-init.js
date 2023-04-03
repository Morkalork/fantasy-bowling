const db = db.getSiblingDB("fba");

db.createCollection("playerInfo");

db.playerInfo.insert({
  gameRank: 1,
  name: "default",
  numberOfSeries: 1,
  points: 1,
  seriesScore: [1, 1, 1, 1],
  total: 1,
});
