import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Entity } from "../../ecs/classes/Entity";

export class EquippedComponent extends Component<EquippedComponent> {
  static _schema = {
    equipperEntity: { type: Types.Ref, default: null },
  }

  public equipperEntity: Entity
}
