import { Entity } from '../../../../ecs/classes/Entity';
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES } from 'three-physx';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { createNetworkRigidBody } from '../../../../interaction/prefabs/NetworkRigidBody';
import { addComponent, getComponent } from '../../../../ecs/functions/EntityFunctions';
import { CollisionGroups, DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { GameObject } from "../../../components/GameObject";
import { addBall } from "./addBall";
import { Vector3, MathUtils } from 'three';



import { isServer } from '../../../../common/functions/isServer';
import { UserControlledColliderComponent } from '../../../../physics/components/UserControllerObjectComponent';
import { GolfCollisionGroups } from '../GolfGameConstants';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const spawnBall = (playerEntity: Entity): void => {

  if(isServer) {
    const body = addBall();
    const uuid = MathUtils.generateUUID();
/*
material: { staticFriction: 0.3, dynamicFriction: 0.3, restitution: 0.9 },
collisionLayer: GolfCollisionGroups.Ball,
collisionMask: DefaultCollisionMask | GolfCollisionGroups.Hole | GolfCollisionGroups.Club,
*/
    createNetworkRigidBody({
      parameters: { body, bodytype: BodyType.DYNAMIC },
      uniqueId: uuid,
      spawn: {
        game: 'Game',
        role: 'GolfBall',
        url: '/models/golf/golf_ball.glb'
      }
    //  ownerId: playerNetworkObject.uniqueId
    })
}
  /*


  const data = {
    game: "Game",
    role: "GolfTee",
    // uuid,
  };
  addComponent(ballEntity, GameObject, data);
  addComponent(ballEntity, UserControlledColliderComponent, { ownerNetworkId: playerNetworkObject.uniqueId });
  */
};
