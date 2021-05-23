import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { getStorage, setStorage } from '../../../../game/functions/functionsStorage';
import { GamePlayer } from '../../../components/GamePlayer';
import { GamesSchema } from '../../GamesSchema';

/**
 * @author Josh Field <github.com/HexaField>
 * Initialises a player's golf ball in their game state storage
 */

export const giveBall = (playerEntity: Entity): void => {

  // const game = getComponent(playerEntity, GamePlayer).game;
  // const gameSchema = GamesSchema[game.gameMode];
  
  
}