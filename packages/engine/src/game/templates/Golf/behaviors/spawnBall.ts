import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { createGolfBallPrefab } from '../prefab/GolfBallPrefab';
import { Network } from '../../../../networking/classes/Network';
import { isClient } from '../../../../common/functions/isClient';
import { GamePlayer } from '../../../components/GamePlayer';
import { Game } from '../../../components/Game';
import { MathUtils } from 'three';
import { GolfPrefabTypes } from '../GolfGameConstants';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const spawnBall = (playerEntity: Entity): void => {

  // server sends clients the entity data
  if (isClient) return;

  const game = getComponent(playerEntity, GamePlayer).game as Game;

  const ownerId = getComponent(playerEntity, NetworkObject).ownerId;

  const networkId = Network.getNetworkId();
  const uuid = MathUtils.generateUUID();

  const parameters = {
    game: game.name,
    uuid
  }

  createGolfBallPrefab({
    networkId,
    uniqueId: uuid,
    ownerId, // the uuid of the player whose ball this is
    parameters
  })


  Network.instance.worldState.createObjects.push({
    networkId,
    ownerId,
    uniqueId: uuid,
    prefabType: GolfPrefabTypes.Ball,
    parameters: JSON.stringify(parameters).replace(/"/g, '\''),
  })
};
