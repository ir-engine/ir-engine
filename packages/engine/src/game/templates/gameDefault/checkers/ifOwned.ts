import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { Checker } from '../../../../game/types/Checker';
import { GamePlayer } from "../../../../game/components/GamePlayer";
import { NetworkObject } from '../../../../networking/components/NetworkObject';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifOwned: Checker = (entity: Entity, args?: any, entityTarget?: Entity ): any | undefined => {

   return getComponent(entity, GamePlayer).uuid == getComponent(entityTarget, NetworkObject).ownerId
};
