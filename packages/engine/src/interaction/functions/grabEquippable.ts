import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { equipEntity } from './equippableFunctions';
import { isInXR } from '../../xr/functions/isInXR';
import { isClient } from '../../common/functions/isClient';
/**
 * @author Josh Field <github.com/HexaField>
 */

export const grabEquippable: Behavior = (grabbableEntity: Entity, args?: any, delta?: number, playerEquippingEntity?: Entity, time?: number, checks?: any): void => {
  if(isClient)console.log('grabEquippable', grabbableEntity, args, delta, playerEquippingEntity, time, checks)
  if(isInXR(playerEquippingEntity)) {
    // TODO: get the hand that is trying to interact
  } else {
    equipEntity(playerEquippingEntity, grabbableEntity);
  }
};
