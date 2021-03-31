import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";

export class DelegatedInputReceiver extends Component<DelegatedInputReceiver> {
  networkId: number;
  static _schema = {
    networkId: { type: Types.Number, default: null }
  }
}
