import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { equipEntity } from './equippableFunctions';
import { isInXR } from '../../xr/functions/WebXRFunctions';
import { isClient } from '../../common/functions/isClient';
import { ParityValue } from '../../common/enums/ParityValue';
import { EquippableAttachmentPoint } from '../enums/EquippedEnums';


/**
 * @author Josh Field <github.com/HexaField>
 */

export const grabEquippable: Behavior = (grabbableEntity: Entity, args?: any, delta?: number, playerEquippingEntity?: Entity, time?: number, checks?: any): void => {
  // if(isClient) console.log('grabEquippable', grabbableEntity, args, delta, playerEquippingEntity, time, checks);
  if(isInXR(playerEquippingEntity)) {
    if(args.side === ParityValue.LEFT) {
      equipEntity(playerEquippingEntity, grabbableEntity, EquippableAttachmentPoint.LEFT_HAND);
    } else {
      equipEntity(playerEquippingEntity, grabbableEntity, EquippableAttachmentPoint.RIGHT_HAND);
    }
  } else {
    equipEntity(playerEquippingEntity, grabbableEntity, args.side === ParityValue.LEFT ? EquippableAttachmentPoint.LEFT_HAND : EquippableAttachmentPoint.RIGHT_HAND);
  }
};
