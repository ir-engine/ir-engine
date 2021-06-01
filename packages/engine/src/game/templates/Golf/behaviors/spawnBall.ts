import { Entity } from '../../../../ecs/classes/Entity';
import { addComponent, getComponent } from '../../../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { createGolfBallPrefab } from '../prefab/GolfBallPrefab';
import { Network } from '../../../../networking/classes/Network';
import { isClient } from '../../../../common/functions/isClient';
import { getGame } from '../../../functions/functions';
import { MathUtils } from 'three';
import { GolfPrefabTypes } from '../GolfGameConstants';
import { TransformComponent } from "../../../../transform/components/TransformComponent";

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const spawnBall = (playerEntity: Entity): void => {

  // server sends clients the entity data
  if (isClient) return;

  const game = getGame(playerEntity);
  const ownerId = getComponent(playerEntity, NetworkObject).ownerId;

  // console.log(ownerId, 'ball exists', game.gameObjects['GolfBall'].length > 0)

  // if a ball already exists in the world, it obviously isn't our turn
  if (game.gameObjects['GolfBall'].length > 0) return;

  const playerHasBall = game.gameObjects['GolfBall']
    .filter((entity) => getComponent(entity, NetworkObject)?.ownerId === ownerId)
    .length > 0;

  if(playerHasBall) return;

  console.log('making ball for player', ownerId, playerHasBall)

  const networkId = Network.getNetworkId();
  const uuid = MathUtils.generateUUID();
  // send position to spawn
  // now we have just one location
  // but soon
  const teeEntity = game.gameObjects['GolfTee'][0]
  console.warn(game.gameObjects);
  const teeTransform = getComponent(teeEntity, TransformComponent);

  const parameters = {
    gameName: game.name,
    role: 'GolfBall',
    spawnPosition: { x: teeTransform.position.x, y: teeTransform.position.y, z: teeTransform.position.z},
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
  })
};
