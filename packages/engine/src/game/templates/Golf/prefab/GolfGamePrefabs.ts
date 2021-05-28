import { GolfPrefabTypes } from "../GolfGameConstants";
import { GolfBallPrefab } from "./GolfBallPrefab";
import { GolfClubPrefab } from "./GolfClubPrefab";

export const GolfPrefabs = {
  [GolfPrefabTypes.Ball]: GolfBallPrefab,
  [GolfPrefabTypes.Club]: GolfClubPrefab,
}