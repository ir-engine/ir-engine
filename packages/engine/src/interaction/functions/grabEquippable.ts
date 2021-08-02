import { Behavior } from '../../common/interfaces/Behavior'
import { Entity } from '../../ecs/classes/Entity'
import { equipEntity } from './equippableFunctions'
import { isInXR } from '../../xr/functions/WebXRFunctions'
import { isClient } from '../../common/functions/isClient'
import { ParityValue } from '../../common/enums/ParityValue'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { getComponent } from '../../ecs/functions/EntityFunctions'

/**
 * @author Josh Field <github.com/HexaField>
 * TODO: needs refactoring
 */

export const grabEquippable: Behavior = (
  grabbableEntity: Entity,
  args?: any,
  delta?: number,
  playerEquippingEntity?: Entity,
  time?: number,
  checks?: any
): void => {
  if (!playerEquippingEntity) return
  // console.log(grabbableEntity, playerEquippingEntity)
  // console.log('grabEquippable', getComponent(grabbableEntity, NetworkObject).networkId, args, delta, getComponent(playerEquippingEntity, NetworkObject).networkId, time, checks);
  if (isInXR(playerEquippingEntity)) {
    if (args.side === ParityValue.LEFT) {
      equipEntity(playerEquippingEntity, grabbableEntity, EquippableAttachmentPoint.LEFT_HAND)
    } else {
      equipEntity(playerEquippingEntity, grabbableEntity, EquippableAttachmentPoint.RIGHT_HAND)
    }
  } else {
    equipEntity(
      playerEquippingEntity,
      grabbableEntity,
      args.side === ParityValue.LEFT ? EquippableAttachmentPoint.LEFT_HAND : EquippableAttachmentPoint.RIGHT_HAND
    )
  }
}
