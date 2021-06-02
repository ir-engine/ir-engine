import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions';
import { Checker } from '../../../../game/types/Checker';
import { GamePlayer } from "../../../../game/components/GamePlayer";
import { GameObject } from "../../../../game/components/GameObject";
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { getTargetEntity } from '../../../../game/functions/functions';
import { HasHadCollision } from "../../../../game/actions/HasHadCollision";
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifOwned: Checker = (entity: Entity, args?: any, entityTarget?: Entity ): any | undefined => {

   return getComponent(entity, GamePlayer).uuid == getComponent(entityTarget, NetworkObject).ownerId
};
