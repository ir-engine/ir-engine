import { BinaryValue } from '../../common/enums/BinaryValue'

type isEquipped = BinaryValue
type equippedEntityId = number

export type EquippedStateUpdateSchema = [isEquipped, equippedEntityId?]

export enum EquippableAttachmentPoint {
  HEAD,
  LEFT_HAND,
  RIGHT_HAND
}
