import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Entity } from "../../ecs/classes/Entity";

export class EquippableComponent extends Component<EquippableComponent> {
  static _schema = {
    equipperEntity:  { type: Types.Ref, default: null},
    data: { type: Types.Ref }
  }

  public equipperEntity: Entity
  public data: any
}
