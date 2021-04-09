import { Component } from "../../ecs/classes/Component";
import { GameObjectPrefab } from "../interfaces/GameObjectPrefab";
import { GameMode } from "../types/GameMode";
import { GameObject } from "./GameObject";
import { Player } from "./Player";

export class Game extends Component<Game> {
    isGlobal: boolean
    players: Player[]
    minPlayers: number
    maxPlayers: number
    gameObjects: GameObject[]
    gameObjectPrefabs: {
        [key: string]: GameObjectPrefab[]
    }
    state: {}
    mode: GameMode<any>
}