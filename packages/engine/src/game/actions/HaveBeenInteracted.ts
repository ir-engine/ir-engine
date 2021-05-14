import { Component } from "../../ecs/classes/Component";
import { Entity } from "../../ecs/classes/Entity";
import { Types } from "../../ecs/types/Types";
/**
 * @author HydraFire <github.com/HydraFire>
 */
export class HaveBeenInteracted extends Component<any> {
  interactingEntity: Entity;
  static _schema = { 
    interactingEntity: { type: Types.Ref, default: null },
  }
}
