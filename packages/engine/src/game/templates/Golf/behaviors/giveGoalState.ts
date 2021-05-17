import { Vector3, Quaternion } from 'three';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from "../../../../ecs/functions/EntityFunctions";
import { addActionComponent, sendActionComponent, applyActionComponent } from '../../../functions/functionsActions';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';

import { getStorage, setStorage } from '../functions/functionsStorage';
import { Interactable } from '../../../../interaction/components/Interactable';
import { GamesSchema } from "../../../../game/templates/GamesSchema";
import { getGame } from '../../../../game/functions/functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */
 function getTargetEntity(entity, entityTarget, args) {
   return args.on === 'target' ? entityTarget : entity;
 }

export const giveGoalState: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const game = getGame(entity);
  const gameSchema = GamesSchema[game.gameMode];
  const nameObject = getComponent(entityTarget, Interactable).data.interactionText ?? '1';

  const entityPlayer = game.gamePlayers[Object.keys(gameSchema.gamePlayerRoles)[nameObject]][0];

  //addStateComponent( entityPlayer, Goal );

};
