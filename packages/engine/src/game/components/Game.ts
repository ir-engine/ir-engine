import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { GameObjectPrefab } from "../interfaces/GameObjectPrefab";
import { GameMode } from "../types/GameMode";
import { GameObject } from "./GameObject";
import { Player } from "./Player";

export class Game extends Component<Game> {
    isGlobal: boolean
    players: Player[]
    minPlayers: number
    maxPlayers: number
    gameMode: GameMode
    gameObjects: GameObject[]
    gameObjectPrefabs: {
        [key: string]: GameObjectPrefab[]
    }
    state: {}
}

Game._schema = {
    isGlobal: { type: Types.Boolean, default: false }, 
    minPlayers: { type: Types.Number, default: null }, 
    maxPlayers: { type: Types.Number, default: null }, 
    gameMode: { type: Types.Ref, default: null }, 
}
