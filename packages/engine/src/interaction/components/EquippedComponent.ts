import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Entity } from "../../ecs/classes/Entity";
import { Object3D, Quaternion, Vector3 } from "three";

export class EquippedComponent extends Component<EquippedComponent> {
  static _schema = {
    equippedEntity: { type: Types.Ref, default: null },
    attachmentObject: { type: Types.Ref, default: null },
    attachmentTransform: { type: Types.Ref, default:  { position: new Vector3(), rotation: new Quaternion() }},
    data: { type: Types.Ref }
  }

  public equippedEntity: Entity
  public attachmentObject: Object3D
  public attachmentTransform: { position: Vector3, rotation: Quaternion }
  public data: any
}
