
import { Entity } from '../../../../ecs/classes/Entity';
import { NetworkPrefab } from '../../../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { RigidBodyComponent } from '../../../../physics/components/RigidBody';
import { initializeNetworkObject } from '../../../../networking/functions/initializeNetworkObject';
import { GolfCollisionGroups, GolfPrefabTypes } from '../GolfGameConstants';
import { UserControlledColliderComponent } from '../../../../physics/components/UserControllerObjectComponent';
import { Group, Mesh, Vector3 } from 'three';
import { AssetLoader } from '../../../../assets/classes/AssetLoader';
import { Engine } from '../../../../ecs/classes/Engine';
import { Body, BodyType, ColliderHitEvent, CollisionEvents, createShapeFromConfig, SHAPES } from 'three-physx';
import { CollisionGroups, DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { addComponent, getComponent, getMutableComponent } from '../../../../ecs/functions/EntityFunctions';
import { isClient } from '../../../../common/functions/isClient';
import { Object3DComponent } from '../../../../scene/components/Object3DComponent';
import { WebGLRendererSystem } from '../../../../renderer/WebGLRendererSystem';
import { GameObject } from '../../../components/GameObject';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { Network } from '../../../../networking/classes/Network';
/**
* @author Josh Field <github.com/HexaField>
 */

const golfBallRadius = 0.03; // this is the graphical size of the golf ball
const golfBallColliderExpansion = 0.03; // this is the size of the ball collider

export const initializeGolfBall = (entity: Entity) => {
  // its transform was set in createGolfBallPrefab from parameters (its transform Golf Tee);
  const transform = getComponent(entity, TransformComponent);

  const networkObject = getComponent(entity, NetworkObject);
  const ownerNetworkObject = Object.values(Network.instance.networkObjects).find((obj) => {
      return obj.ownerId === networkObject.ownerId;
  }).component;
  addComponent(entity, UserControlledColliderComponent, { ownerNetworkId: ownerNetworkObject.networkId });

  if(isClient) {
    AssetLoader.load({
      url: Engine.publicPath + '/models/golf/golf_ball.glb',
    }, (group: Group) => {
      const ballGroup = group.clone(true);
      const ballMesh = ballGroup.children[0] as Mesh;
      group.remove(group.children[0]);
      ballMesh.position.copy(transform.position);
      ballMesh.scale.copy(transform.scale);
      ballMesh.castShadow = true;
      ballMesh.receiveShadow = true;
      ballMesh.material && WebGLRendererSystem.instance.csm.setupMaterial(ballMesh.material);
      addComponent(entity, Object3DComponent, { value: ballMesh });
      Engine.scene.add(ballMesh);
      console.log('loaded golf ball model')
    });
  }

  const shape = createShapeFromConfig({
    shape: SHAPES.Sphere,
    options: { radius: golfBallRadius + golfBallColliderExpansion },
    config: {
      restOffset: -golfBallColliderExpansion, // we add a rest offset to make the contact detection of the ball bigger, without making the actual size of the ball bigger
      contactOffset: -golfBallColliderExpansion + 0.01, // we mostly reverse the expansion
      material: { staticFriction: 0.3, dynamicFriction: 0.3, restitution: 0.9 },
      collisionLayer: GolfCollisionGroups.Ball,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.TrimeshColliders | GolfCollisionGroups.Hole,
    },
  });

  const body = PhysicsSystem.instance.addBody(new Body({
    shapes: [shape],
    type:  BodyType.DYNAMIC,
    transform: {
      translation: { x: transform.position.x, y: transform.position.y, z: transform.position.z }
    },
    userData: entity
  }));

  const collider = getMutableComponent(entity, ColliderComponent);
  collider.body = body;
}

export const createGolfBallPrefab = ( args:{ parameters?: any, networkId?: number, uniqueId: string, ownerId?: string }) => {
  console.log('createGolfBallPrefab')
  initializeNetworkObject({
    prefabType: GolfPrefabTypes.Ball,
    uniqueId: args.uniqueId,
    ownerId: args.ownerId,
    networkId: args.networkId,
    prefabParameters: args.parameters,
    override: {
      networkComponents: [
        {
          type: GameObject,
          data: {
            gameName: args.parameters.gameName,
            role: args.parameters.role,
            uuid: args.parameters.uuid
          }
        },
        {
          type: TransformComponent,
          data: {
            position: new Vector3(args.parameters.spawnPosition.x, args.parameters.spawnPosition.y, args.parameters.spawnPosition.z),
            scale: new Vector3().setScalar(golfBallRadius)
          }
        }
      ]
    }
  });
}

// Prefab is a pattern for creating an entity and component collection as a prototype
export const GolfBallPrefab: NetworkPrefab = {
  initialize: createGolfBallPrefab,
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    { type: ColliderComponent },
    { type: RigidBodyComponent },
    { type: GameObject }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
  //clientComponents: [{ type: InterpolationComponent, data: { } }],
  clientComponents: [],
  serverComponents: [],
  onAfterCreate: [
    {
      behavior: initializeGolfBall,
      networked: true
    }
  ],
  onBeforeDestroy: []
};
