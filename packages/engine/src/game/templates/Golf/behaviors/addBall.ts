import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES, Transform } from 'three-physx';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { createNetworkRigidBody } from '../../../../interaction/prefabs/NetworkRigidBody';
import { addComponent, getComponent } from '../../../../ecs/functions/EntityFunctions';
import { getStorage, setStorage } from '../../../functions/functionsStorage';
import { onInteraction, onInteractionHover } from '../../../../scene/behaviors/createCommonInteractive';
import { Interactable } from '../../../../interaction/components/Interactable';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { GameObject } from "../../../components/GameObject";
import { CollisionGroups, DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addBall: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any) => {

//  const uuid = getComponent(entity, GameObject).uuid;
//  const storageTransform = getComponent(entity, TransformComponent);//getStorage(entity, TransformComponent);
//  const pos = storageTransform.position ?? { x:0, y:0, z:0 };
//  const rot = storageTransform.rotation ?? { x:0, y:0, z:0, w:1 };
  //const scale = storageTransform.scale  ?? { x:1, y:1, z:1 };

  const teeTransform = {
    position: {x:1, y:2, z:2}
  }

  const shapeBall: Shape = createShapeFromConfig({
    shape: SHAPES.Sphere,
    options: { radius: 0.5 },
    config: {
      material: { staticFriction: 0.3, dynamicFriction: 0.3, restitution: 0.9 },
      // TODO - bump physx
      // collisionLayer: CollisionGroups.Default,
      // collisionMask: DefaultCollisionMask,
    },
    collisionLayer: CollisionGroups.Default,
    collisionMask: DefaultCollisionMask,
  });

  const body = new Body({
    shapes: [shapeBall],
    type: BodyType.DYNAMIC,
    transform: new Transform({
      transform: {
        translation: { x: teeTransform.position.x, y: teeTransform.position.y, z: teeTransform.position.z }
      }
    }),
  });

  PhysicsSystem.instance.addBody(body);

/*
  createNetworkRigidBody({
    entity,
    parameters: { body, bodytype: BodyType.DYNAMIC },
    uniqueId: uuid,
    // ownerId:
  })
  */
  return body;
};
/*


  //addComponent(ballEntity, SceneTagComponent);
  // TODO: get tee transform once spawnBall is called from nextTurn or whatever
  // just hardcode for now
  const teeTransform = {
    position: new Vector3(1, 2, 2)
  }
//  addComponent(ballEntity, VisibleTagComponent);

  const shape: Shape = createShapeFromConfig({
    shape: SHAPES.Sphere,
    options: { radius: 0.1 },
    config: {
      material: { staticFriction: 0.3, dynamicFriction: 0.3, restitution: 0.9 },
      // TODO - bump physx
      // collisionLayer: CollisionGroups.Default,
      // collisionMask: DefaultCollisionMask,
    },
    collisionLayer: CollisionGroups.Default,
    collisionMask: DefaultCollisionMask,
  });

  const body = PhysicsSystem.instance.addBody(new Body({
    shapes: [shape],
    type:  BodyType.DYNAMIC,
    transform: {
      translation: { x: teeTransform.position.x, y: teeTransform.position.y, z: teeTransform.position.z }
    }
  }));
*/
