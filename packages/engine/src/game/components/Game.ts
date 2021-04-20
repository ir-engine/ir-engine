import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { GameObjectPrefab } from "../interfaces/GameObjectPrefab";
import { GameMode } from "../types/GameMode";
import { GameObject } from "./GameObject";
import { GamePlayer } from "./GamePlayer";

export type GameName = string

export class Game extends Component<Game> {
    name: string
    gameMode: string
    isGlobal: boolean
    minPlayers: number
    maxPlayers: number
    gameArea: {
      min: { x: number, y: number, z: number},
      max: { x: number, y: number, z: number}
    }
    gamePlayers: {
      [key: string]: GamePlayer[]
    }
    gameObjects: {
      [key: string]: GameObject[]
    }
    gameObjectPrefabs: {
        [key: string]: GameObjectPrefab[]
    }
    state: {}
}

Game._schema = {
    name: { type: Types.String, default: null },
    isGlobal: { type: Types.Boolean, default: false },
    gameArea: { type: Types.Ref, default: null },
    gamePlayers: { type: Types.Ref, default: {} },
    gameObjects: { type: Types.Ref, default: {} },
    minPlayers: { type: Types.Number, default: null },
    maxPlayers: { type: Types.Number, default: null },
    gameMode: { type: Types.String, default: null },
    state: { type: Types.Ref, default: {} }
}
