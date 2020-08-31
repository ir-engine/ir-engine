import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import {
  createBox,
  createCylinder,
  createSphere,
  createConvexGeometry,
  createGroundGeometry
} from './PhysicsBehaviors';
import { Entity } from '../../ecs/classes/Entity';
import { PhysicsManager } from '../components/PhysicsManager';
import { getMutableComponent, hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { Vec3, Shape, Body } from 'cannon-es';
import debug from "cannon-es-debugger"
import { Color, Mesh } from 'three';
import { Engine } from '../../ecs/classes/Engine';

export const addCollider: Behavior = (entity: Entity, args: { type: string }): void => {
  console.log("*** Adding collider")
  const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
    const transform = addComponent<TransformComponent>(entity, TransformComponent);
    if(collider.type === undefined) collider.type === args.type ?? 'box'

    console.log("collider collider")
    let body;
    if (collider.type === 'box') body = createBox(entity);
    else if (collider.type === 'cylinder') body = createCylinder(entity);
    else if (collider.type === 'sphere') body = createSphere(entity);
    else if (collider.type === 'convex') body = createConvexGeometry(entity, getMutableComponent<Object3DComponent>(entity, Object3DComponent as any).value);
    else if (collider.type === 'ground') body = createGroundGeometry(entity);

    collider.collider = body;
    console.log(collider.collider)

    // If this entity has an object3d, get the position of that
    // if(hasComponent(entity, Object3DComponent)){
    //   body.position = cannonFromThreeVector(getComponent<Object3DComponent>(entity, Object3DComponent).value.position)
    // } else {
    //   body.position = new Vec3()
    // }

  
  PhysicsManager.instance.physicsWorld.addBody(collider.collider);
  console.log(PhysicsManager.instance.physicsWorld)

  const DebugOptions = {
    onInit: (body: Body, mesh: Mesh, shape: Shape) => 	console.log("body: ", body, " | mesh: ", mesh, " | shape: ", shape),
    onUpdate: (body: Body, mesh: Mesh, shape: Shape) => console.log("body position: ", body.position, " | body: ", body, " | mesh: ", mesh, " | shape: ", shape)
    }
  debug(Engine.scene, PhysicsManager.instance.physicsWorld.bodies, DebugOptions)
  
};
