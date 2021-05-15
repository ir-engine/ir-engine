import { Quaternion, Vector3 } from 'three';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Engine } from '../../../../ecs/classes/Engine';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { XRInputReceiver } from '../../../../input/components/XRInputReceiver';
import { equipEntity } from '../../../../interaction/functions/equippableFunctions';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const grabGolfClub: Behavior = (golfClubEntity: Entity, args?: any, delta?: number, playerEquippingEntity?: Entity, time?: number, checks?: any): void => {
  console.log('grabGolfClub', golfClubEntity, args, delta, playerEquippingEntity, time, checks)
  equipEntity(playerEquippingEntity, golfClubEntity);
};
