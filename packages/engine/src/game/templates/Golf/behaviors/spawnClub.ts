import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES, Transform } from 'three-physx';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { getStorage, setStorage } from '../../../functions/functionsStorage';
import { createNetworkRigidBody } from '../../../../interaction/prefabs/NetworkRigidBody';
import { CollisionGroups, DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { GameObject } from "../../../components/GameObject";
import { createEntity, getComponent } from '../../../../ecs/functions/EntityFunctions';
import { GolfCollisionGroups, GolfPrefabTypes } from '../GolfGameConstants';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { Euler, MathUtils, Quaternion, Vector3 } from 'three';
import { equipEntity } from '../../../../interaction/functions/equippableFunctions';
import { EquippableAttachmentPoint } from '../../../../interaction/enums/EquippedEnums';
import { Network } from '../../../../networking/classes/Network';
import { isClient } from '../../../../common/functions/isClient';
import { getGame } from '../../../functions/functions';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { createGolfClubPrefab } from '../prefab/GolfClubPrefab';
import { Object3DComponent } from '../../../../scene/components/Object3DComponent';
import { CharacterComponent } from '../../../../character/components/CharacterComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const spawnClub: Behavior = (entityPlayer: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {

  // server sends clients the entity data
  if (isClient) return;
  
  const game = getGame(entityPlayer);
  const ownerId = getComponent(entityPlayer, NetworkObject).ownerId;

  console.log('spawning club for player', ownerId)

  const networkId = Network.getNetworkId();
  const uuid = MathUtils.generateUUID();

  const parameters = {
    gameName: game.name,
    role: 'GolfClub',
    uuid
  };

  // this spawns the club on the server
  createGolfClubPrefab({
    networkId,
    uniqueId: uuid,
    ownerId, // the uuid of the player whose balclubl this is
    parameters
  })

  // this sends the club to the clients
  Network.instance.worldState.createObjects.push({
    networkId,
    ownerId,
    uniqueId: uuid,
    prefabType: GolfPrefabTypes.Club,
    parameters: JSON.stringify(parameters).replace(/"/g, '\''),
  })
};