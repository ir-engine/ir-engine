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

export const updateClub: Behavior = (entity: Entity) => {
  // client controls club and ball, so we don't need to worry about updating logic here on server
  // if(!isClient) return;
  // const collider = getComponent(entity, ColliderComponent)
  // const obj3d = getComponent(entity, Object3DComponent).value
  // const localActor = getComponent(Network.instance.localClientEntity, CharacterComponent)
  // if(collider.body.type === BodyType.KINEMATIC) {
  //   const theta = Math.atan2(localActor.orientation.x, localActor.orientation.z) * 180 / Math.PI + 180
  //   const flatRot = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), (theta - 180) * (Math.PI / 180));
  //   collider.body.shapes[0].transform.rotation.x = flatRot.x
  //   collider.body.shapes[0].transform.rotation.y = flatRot.y
  //   collider.body.shapes[0].transform.rotation.z = flatRot.z
  //   collider.body.shapes[0].transform.rotation.w = flatRot.w
  //   // child 1 is the club head
  //   obj3d.children[1].quaternion.set(flatRot.x, flatRot.y, flatRot.z, flatRot.w)
  //   console.log(localActor, theta, flatRot)
  // }
}