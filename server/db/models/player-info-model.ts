import { model } from "mongoose";
import type { PlayerInfo } from "../../scraper/types";
import { PlayerInfoSchema } from "../schemas/player-info-schema";

export const PlayerInfoModel = model<PlayerInfo>(
  "PlayerInfo",
  PlayerInfoSchema
);
