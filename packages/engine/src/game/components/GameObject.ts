import { Component } from "../../ecs/classes/Component";
import { GameObjectRole } from "../types/GameObjectRole";
import { Game } from "./Game";
import { Player } from "../types/Player";

export class GameObject extends Component<GameObject> {
    // game: Game
    game: Game
    player: Player
    role: GameObjectRole
}