import { Entity } from '../../../../ecs/classes/Entity';
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES } from 'three-physx';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { createNetworkRigidBody } from '../../../../interaction/prefabs/NetworkRigidBody';
import { addComponent, getComponent } from '../../../../ecs/functions/EntityFunctions';
import { DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { GameObject } from "../../../components/GameObject";
import { SceneTagComponent, VisibleTagComponent } from '../../../../scene/components/Object3DTagComponents';
import { Vector3, MathUtils } from 'three';
import { AssetLoader } from '../../../../assets/classes/AssetLoader';
import { Engine } from '../../../../ecs/classes/Engine';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { UserControlledColliderComponent } from '../../../../physics/components/UserControllerObjectComponent';
import { GolfCollisionGroups } from '../GolfGameConstants';
import { isClient } from '../../../../common/functions/isClient';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const spawnBall = (playerEntity: Entity): void => {

  const playerNetworkObject = getComponent(playerEntity, NetworkObject);

  const ballEntity = new Entity();
  addComponent(ballEntity, SceneTagComponent);
  // TODO: get tee transform once spawnBall is called from nextTurn or whatever
  // just hardcode for now
  const teeTransform = {
    position: new Vector3(4.166, -0.05, -7.9)
  }
  addComponent(ballEntity, TransformComponent, teeTransform);
  addComponent(ballEntity, VisibleTagComponent);
  AssetLoader.load({
    url: Engine.publicPath + '/models/golf/golf_ball.glb',
    entity: ballEntity,
  }, (group) => {
    const shape = createShapeFromConfig({
      shape: SHAPES.Sphere,
      options: { radius: 0.1 },
      config: {
        material: { staticFriction: 0.3, dynamicFriction: 0.3, restitution: 0.9 },
        collisionLayer: GolfCollisionGroups.Ball,
        collisionMask: DefaultCollisionMask | GolfCollisionGroups.Hole | GolfCollisionGroups.Club,
      },
    });

    const body = PhysicsSystem.instance.addBody(new Body({
      shapes: [shape],
      type:  BodyType.DYNAMIC,
      transform: {
        translation: { x: teeTransform.position.x, y: teeTransform.position.y, z: teeTransform.position.z }
      }
    }));

    if(!isClient) {
      const uuid = MathUtils.generateUUID();
      createNetworkRigidBody({
        entity: ballEntity,
        parameters: { body, bodytype: BodyType.DYNAMIC },
        uniqueId: uuid,
        ownerId: playerNetworkObject.uniqueId
      })
    }
  });

  const data = {
    game: "Game",
    role: "GolfTee",
    // uuid,
  };
  addComponent(ballEntity, GameObject, data);
  addComponent(ballEntity, UserControlledColliderComponent, { ownerNetworkId: playerNetworkObject.uniqueId });
};
