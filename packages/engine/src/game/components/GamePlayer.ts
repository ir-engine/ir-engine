import { Component } from "../../ecs/classes/Component";
import { GamePlayerRole } from "../types/GamePlayerRole";
import { GameName } from "./Game";
import { Types } from "../../ecs/types/Types";

export class GamePlayer extends Component<GamePlayer> {
    gameName: GameName
    role: GamePlayerRole
}

GamePlayer._schema = {
  gameName: { type: Types.String, default: null },
  role: { type: Types.String, default: null }
};
