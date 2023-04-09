/**
 * This is run during the docker setup.
 */
console.log(' # # # # SETTING UP DB!');
const db = db.getSiblingDB("fb");

db.createCollection("playerInfo");

db.playerInfo.insert({
  gameRank: 1,
  name: "default",
  numberOfSeries: 1,
  points: 1,
  seriesScore: [1, 1, 1, 1],
  total: 1,
});
