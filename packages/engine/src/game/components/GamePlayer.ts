import { Component } from "../../ecs/classes/Component";
import { GamePlayerRole } from "../types/GamePlayerRole";
import { Game } from "./Game";
import { Types } from "../../ecs/types/Types";

export class GamePlayer extends Component<GamePlayer> {
  game: Game
  role: string
  uuid: string
}

GamePlayer._schema = {
  game: { type: Types.Ref, default: null },
  role: { type: Types.String, default: null },
  uuid: { type: Types.String, default: null }
};
