import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { Entity } from '../../ecs/classes/Entity'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'

export class EquippedComponent extends Component<EquippedComponent> {
  static _schema = {
    attachmentPoint: { type: Types.Number, default: EquippableAttachmentPoint.RIGHT_HAND },
    equipperEntity: { type: Types.Ref, default: null }
  }

  public attachmentPoint: EquippableAttachmentPoint
  public equipperEntity: Entity
}
