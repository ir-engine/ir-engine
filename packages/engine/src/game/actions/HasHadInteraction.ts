import { Component } from "../../ecs/classes/Component";
import { Entity } from "../../ecs/classes/Entity";
import { Types } from "../../ecs/types/Types";
/**
 * @author HydraFire <github.com/HydraFire>
 */
export class HasHadInteraction extends Component<any> {
  entityNetworkId?: number;
  args?: any;
  static _schema = { 
    entityNetworkId: { type: Types.Number, default: null },
    args: { type: Types.Ref, default: null }
  }
}
