import { Component } from "../../ecs/classes/Component";
import { GameObjectRole } from "../types/GameObjectRole";
import { GameName } from "./Game";
import { Types } from "../../ecs/types/Types";

export class GameObject extends Component<GameObject> {
    gameName: GameName
    role: GameObjectRole
}

GameObject._schema = {
  gameName: { type: Types.String, default: null },
  role: { type: Types.String, default: null }
};
