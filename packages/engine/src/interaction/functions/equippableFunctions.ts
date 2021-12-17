import { ParityValue } from '../../common/enums/ParityValue'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'

export const equipEntity = (
  equipperEntity: Entity,
  equippedEntity: Entity,
  attachmentPoint: EquippableAttachmentPoint = EquippableAttachmentPoint.RIGHT_HAND,
  islocalEvent: boolean = false
): void => {
  if (!hasComponent(equipperEntity, EquipperComponent) && !hasComponent(equippedEntity, EquippedComponent)) {
    addComponent(equipperEntity, EquipperComponent, { equippedEntity, data: {} as any })
    addComponent(equippedEntity, EquippedComponent, { equipperEntity, attachmentPoint })

    dispatchEquipEntity(equippedEntity, true, islocalEvent)
  }
}

export const unequipEntity = (equipperEntity: Entity, islocalEvent: boolean = false): void => {
  console.log('unequip')
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  if (!equipperComponent) return

  console.log(equipperComponent)
  removeComponent(equipperEntity, EquipperComponent)
  dispatchEquipEntity(equipperComponent.equippedEntity, false, islocalEvent)
}

const dispatchEquipEntity = (equippedEntity: Entity, equip: boolean, islocalEvent: boolean): void => {
  const world = useWorld()
  if (Engine.userId === world.hostId) return

  const equippedComponent = getComponent(equippedEntity, EquippedComponent)
  const attachmentPoint = equippedComponent.attachmentPoint
  const networkComponet = getComponent(equippedEntity, NetworkObjectComponent)

  let dispatchTo = 'all'
  if (islocalEvent) dispatchTo = 'local'

  dispatchFrom(Engine.userId, () =>
    NetworkWorldAction.setEquippedObject({
      object: {
        ownerId: networkComponet.ownerId,
        networkId: networkComponet.networkId
      },
      attachmentPoint: attachmentPoint,
      equip: equip
    })
  )
    .to(dispatchTo as any)
    .cache({ removePrevious: true })
}

export const getAttachmentPoint = (parityValue: ParityValue): EquippableAttachmentPoint => {
  let attachmentPoint = EquippableAttachmentPoint.RIGHT_HAND
  if (parityValue === ParityValue.LEFT) attachmentPoint = EquippableAttachmentPoint.LEFT_HAND

  return attachmentPoint
}

export const getParity = (attachmentPoint: EquippableAttachmentPoint): ParityValue => {
  let parityValue = ParityValue.RIGHT
  if (attachmentPoint === EquippableAttachmentPoint.LEFT_HAND) parityValue = ParityValue.LEFT

  return parityValue
}
