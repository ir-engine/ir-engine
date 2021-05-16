import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { equipEntity } from './equippableFunctions';
import { getHandPosition, isInXR } from '../../xr/functions/WebXRFunctions';
import { isClient } from '../../common/functions/isClient';
import { ParityValue } from '../../common/enums/ParityValue';
import { EquippableAttachmentPoint } from '../enums/EquippedEnums';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { CharacterComponent } from '../../character/components/CharacterComponent';

/**
 * @author Josh Field <github.com/HexaField>
 */

export const grabEquippable: Behavior = (grabbableEntity: Entity, args?: any, delta?: number, playerEquippingEntity?: Entity, time?: number, checks?: any): void => {
  if(isClient) console.log('grabEquippable', grabbableEntity, args, delta, playerEquippingEntity, time, checks);
  if(isInXR(playerEquippingEntity)) {
    // get grab distance
    const grabbableTransform = getComponent(grabbableEntity, TransformComponent);
    const leftHandPosition = getHandPosition(playerEquippingEntity, ParityValue.LEFT);
    const rightHandPosition = getHandPosition(playerEquippingEntity, ParityValue.RIGHT);
    if(args.side === ParityValue.LEFT) {
      if(leftHandPosition && leftHandPosition.distanceTo(grabbableTransform.position) < 0.5) {
        equipEntity(playerEquippingEntity, grabbableEntity, EquippableAttachmentPoint.LEFT_HAND);
      }
    } else {
      if(rightHandPosition && rightHandPosition.distanceTo(grabbableTransform.position) < 0.5) {
        equipEntity(playerEquippingEntity, grabbableEntity, EquippableAttachmentPoint.RIGHT_HAND);
      }
    }
  } else {
    equipEntity(playerEquippingEntity, grabbableEntity, args.side === ParityValue.LEFT ? EquippableAttachmentPoint.LEFT_HAND : EquippableAttachmentPoint.RIGHT_HAND);
  }
};
