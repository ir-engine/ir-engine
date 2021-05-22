import { Component } from "../../ecs/classes/Component";
import { Game } from "./Game";
import { Types } from "../../ecs/types/Types";
/**
 * @author HydraFire <github.com/HydraFire>
 */
export class GameObject extends Component<any> {
  game: Game
  role: string
  uuid: string
  
  static _schema = {
    game: { type: Types.Ref, default: null },
    role: { type: Types.String, default: null },
    uuid: { type: Types.String, default: null }
  }; 
}