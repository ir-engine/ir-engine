import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { createGolfBallPrefab } from '../prefab/GolfBallPrefab';
import { Network } from '../../../../networking/classes/Network';
import { isClient } from '../../../../common/functions/isClient';
import { GamePlayer } from '../../../components/GamePlayer';
import { Game } from '../../../components/Game';
import { MathUtils } from 'three';
import { GolfPrefabTypes } from '../GolfGameConstants';
import { addStateComponent } from '../../../functions/functionsState';
import { YourTurn } from '../components/YourTurnTagComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const spawnBall = (playerEntity: Entity): void => {

  // server sends clients the entity data
  if (isClient) return;

  const game = getComponent(playerEntity, GamePlayer).game as Game;
  const ownerId = getComponent(playerEntity, NetworkObject).ownerId;

  // console.log(ownerId, 'ball exists', game.gameObjects['GolfBall'].length > 0)

  // if a ball already exists in the world, it obviously isn't our turn
  if(game.gameObjects['GolfBall'].length > 0) return;
  
  const playerHasBall = game.gameObjects['GolfBall'].filter((entity) => {
    return getComponent(entity, NetworkObject)?.ownerId === ownerId;
  }).length > 0;


  // console.log(ownerId, 'playerHasBall', playerHasBall)

  // if we already have a ball in the world, we shouldn't spawn a new one
  if(playerHasBall) return;

  console.log('making ball for player', ownerId)
  
  const networkId = Network.getNetworkId();
  const uuid = MathUtils.generateUUID();

  const parameters = {
    gameName: game.name,
    uuid
  };

  // this spawns the ball on the server
  createGolfBallPrefab({
    networkId,
    uniqueId: uuid,
    ownerId, // the uuid of the player whose ball this is
    parameters
  })

  // this sends the ball to the clients
  Network.instance.worldState.createObjects.push({
    networkId,
    ownerId,
    uniqueId: uuid,
    prefabType: GolfPrefabTypes.Ball,
    parameters: JSON.stringify(parameters).replace(/"/g, '\''),
  } as any)
};
