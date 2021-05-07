import { Entity } from '../../../../ecs/classes/Entity';
import { Checker } from '../../../../game/types/Checker';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { Game } from "../../../../game/components/Game";
import { GameObject } from "../../../../game/components/GameObject";
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const isPlayersInGame: Checker = (entity: Entity, args?: any, entityTarget?: Entity ): any | undefined => {
  let count = 0;
  const gamePlayers = (getComponent<GameObject>(entity, GameObject).game as Game).gamePlayers;
  Object.keys(gamePlayers).forEach(role => {
   count += gamePlayers[role].length;
  })
  if (count > 0) {

    if (args.invert) {
      return undefined;
    } else {
      return { count: count};
    }

  } else {
    
    if (args.invert) {
      return { count: count};
    } else {
      return undefined;
    }
  }
};
