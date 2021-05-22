import { Component } from "../../../../ecs/classes/Component";
import { Types } from "../../../../ecs/types/Types";

/**
 * @author HydraFire <github.com/HydraFire>
 */

export class YourTurn extends Component<YourTurn> {
  ballNetworkId: number;
  static _schema = {
    ballNetworkId: { type: Types.Number, default: undefined }
  }
}
