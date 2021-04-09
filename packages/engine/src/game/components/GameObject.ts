import { Component } from "../../ecs/classes/Component";
import { GameObjectRole } from "../types/GameObjectRole";
import { Player } from "./Player";

export class GameObject extends Component<GameObject> {
    // game: Game
    player: Player
    role: GameObjectRole
}