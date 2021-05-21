
import { Entity } from '../../../../ecs/classes/Entity';
import { Network } from '../../../../networking/classes/Network';
import { NetworkPrefab } from '../../../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { RigidBodyComponent } from '../../../../physics/components/RigidBody';
import { initializeNetworkObject } from '../../../../networking/functions/initializeNetworkObject';
import { GolfCollisionGroups, GolfPrefabTypes } from '../GolfGameConstants';
import { UserControlledColliderComponent } from '../../../../physics/components/UserControllerObjectComponent';
import { GameObject } from '../../../components/GameObject';
import { Vector3 } from 'three';
import { AssetLoader } from '../../../../assets/classes/AssetLoader';
import { Engine } from '../../../../ecs/classes/Engine';
import { Body, BodyType, createShapeFromConfig, SHAPES } from 'three-physx';
import { DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { getComponent, getMutableComponent } from '../../../../ecs/functions/EntityFunctions';
import { onInteraction, onInteractionHover } from '../../../../scene/behaviors/createCommonInteractive';
import { Interactable } from '../../../../interaction/components/Interactable';

/**
* @author Josh Field <github.com/HexaField>
 */

export const initializeGolfBall = (entity: Entity) => {
  const teeTransform = getComponent(entity, TransformComponent);

  AssetLoader.load({
    url: Engine.publicPath + '/models/golf/golf_ball.glb',
    entity,
  });

  const shape = createShapeFromConfig({
    shape: SHAPES.Sphere,
    options: { radius: 0.025 },
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
            game: args.parameters.game,
            role: 'GolfBall', // TODO: make this a constant
            uuid: args.parameters.uuid
          }
        }
      ]
    }
  });
}

const interactiveData = {
  onInteraction: onInteraction,
  onInteractionFocused: onInteractionHover,
  onInteractionCheck: () => { return true },
  data: {
    interactionType: "gameobject",
    interactionText: "1"
  }
};

// Prefab is a pattern for creating an entity and component collection as a prototype
export const GolfBallPrefab: NetworkPrefab = {
  initialize: createGolfBallPrefab,
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent, data: { position: new Vector3(4.166, -0.05, -7.9) } },
    { type: ColliderComponent },
    { type: Interactable, data: interactiveData },
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
