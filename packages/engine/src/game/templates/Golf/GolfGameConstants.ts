import { Engine } from "../../../ecs/classes/Engine";
import { GolfBallPrefab } from "./prefab/GolfBallPrefab";

export enum GolfCollisionGroups {
  Ball = 1 << 10,
  Hole = 1 << 11,
  Club = 1 << 12,
}

export enum GolfPrefabTypes {
  Ball = 10, // TODO: make a prefab register
}

export const GolfPrefabs = {
  [GolfPrefabTypes.Ball]: GolfBallPrefab
}