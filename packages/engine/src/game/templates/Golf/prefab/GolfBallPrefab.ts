
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
import { Body, BodyType, createShapeFromConfig, SHAPES } from 'three-physx';
import { DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { addComponent, getComponent, getMutableComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions';
import { isClient } from '../../../../common/functions/isClient';
import { Object3DComponent } from '../../../../scene/components/Object3DComponent';
import { WebGLRendererSystem } from '../../../../renderer/WebGLRendererSystem';
import { getGameEntityFromName, getGameFromName } from '../../../functions/functions';
import { GameObject } from '../../../components/GameObject';

/**
* @author Josh Field <github.com/HexaField>
 */

const golfBallRadius = 0.03;

export const initializeGolfBall = (entity: Entity) => {
  const teeTransform = getComponent(entity, TransformComponent);

  console.log('initializeGolfBall', getComponent(entity, GameObject).game.name)

  if(isClient) {
    AssetLoader.load({
      url: Engine.publicPath + '/models/golf/golf_ball.glb',
    }, (group: Group) => {
      const ballGroup = group.clone(true);
      const ballMesh = ballGroup.children[0] as Mesh;
      group.remove(group.children[0]);
      ballMesh.position.copy(teeTransform.position);
      ballMesh.scale.copy(teeTransform.scale);
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
    options: { radius: golfBallRadius },
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

  const collider = getMutableComponent(entity, ColliderComponent);
  collider.body = body;
}

export const createGolfBallPrefab = ( args:{ parameters?: any, networkId?: number, uniqueId: string, ownerId?: string }) => {
  initializeNetworkObject({
    prefabType: GolfPrefabTypes.Ball,
    uniqueId: args.uniqueId,
    ownerId: args.ownerId,
    networkId: args.networkId,
    override: { 
      networkComponents: [
        {
          type: UserControlledColliderComponent,
          data: { ownerNetworkId: args.ownerId }
        },
        {
          type: GameObject,
          data: {
            game: getGameFromName(args.parameters.gameName),
            role: 'GolfBall', // TODO: make this a constant
            uuid: args.parameters.uuid
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
    { type: TransformComponent, data: { position: new Vector3(4.166, -0.05, -7.9), scale: new Vector3().setScalar(golfBallRadius) } },
    { type: ColliderComponent },
    { type: RigidBodyComponent },
    { type: UserControlledColliderComponent },
    { type: GameObject }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
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
