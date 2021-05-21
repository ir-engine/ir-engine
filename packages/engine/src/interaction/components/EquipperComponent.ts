import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Entity } from "../../ecs/classes/Entity";
import { EquippableAttachmentPoint } from "../enums/EquippedEnums";

export class EquipperComponent extends Component<EquipperComponent> {
  static _schema = {
    equippedEntity: { type: Types.Ref, default: null },
    attachmentPoint: { type: Types.Ref, default: EquippableAttachmentPoint.RIGHT_HAND },
    data: { type: Types.Ref }
  }

  public equippedEntity: Entity
  public attachmentPoint: EquippableAttachmentPoint
  public data: any
}
