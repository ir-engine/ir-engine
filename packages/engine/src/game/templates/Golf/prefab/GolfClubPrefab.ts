
import { Entity } from '../../../../ecs/classes/Entity';
import { NetworkPrefab } from '../../../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { RigidBodyComponent } from '../../../../physics/components/RigidBody';
import { initializeNetworkObject } from '../../../../networking/functions/initializeNetworkObject';
import { GolfCollisionGroups, GolfPrefabTypes } from '../GolfGameConstants';
import { UserControlledColliderComponent } from '../../../../physics/components/UserControllerObjectComponent';
import { BoxBufferGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { AssetLoader } from '../../../../assets/classes/AssetLoader';
import { Engine } from '../../../../ecs/classes/Engine';
import { Body, BodyType, createShapeFromConfig, SHAPES, Transform } from 'three-physx';
import { CollisionGroups } from '../../../../physics/enums/CollisionGroups';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { addComponent, getComponent, getMutableComponent } from '../../../../ecs/functions/EntityFunctions';
import { isClient } from '../../../../common/functions/isClient';
import { Object3DComponent } from '../../../../scene/components/Object3DComponent';
import { WebGLRendererSystem } from '../../../../renderer/WebGLRendererSystem';
import { GameObject } from '../../../components/GameObject';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { equipEntity } from '../../../../interaction/functions/equippableFunctions';
import { Network } from '../../../../networking/classes/Network';
import { EquippableAttachmentPoint } from '../../../../interaction/enums/EquippedEnums';
/**
* @author Josh Field <github.com/HexaField>
 */

export const initializeGolfClub = (entity: Entity) => {
  // its transform was set in createGolfClubPrefab from parameters (its transform Golf Tee);
  const transform = getComponent(entity, TransformComponent);

  const networkObject = getComponent(entity, NetworkObject);
  const ownerNetworkObject = Object.values(Network.instance.networkObjects).find((obj) => {
      return obj.ownerId === networkObject.ownerId;
  }).component;
  addComponent(entity, UserControlledColliderComponent, { ownerNetworkId: ownerNetworkObject.networkId });


  // if(isClient) {
  //   const clubGroup = new Group();
  //   const clubHandleMesh = new Mesh(new BoxBufferGeometry(0.05, 0.05, 0.25), new MeshStandardMaterial({ color: 0xff2126 }))
  //   WebGLRendererSystem.instance.csm.setupMaterial(clubHandleMesh.material)
  //   const clubHeadMesh = new Mesh(new BoxBufferGeometry(0.025, 0.1, 0.05), new MeshStandardMaterial({ color: 0xff2126 }))
  //   clubHeadMesh.position.set(0, 0.1, -1.7)
  //   clubGroup.add(clubHandleMesh, clubHeadMesh)
  //   WebGLRendererSystem.instance.csm.setupMaterial(clubHandleMesh.material)
  //   WebGLRendererSystem.instance.csm.setupMaterial(clubHeadMesh.material)
  //   addComponent(entity, Object3DComponent, { value: clubGroup })
  //   Engine.scene.add(clubGroup)
  // }

  if(isClient) {
    AssetLoader.load({
      url: Engine.publicPath + '/models/golf/golf_club.glb',
    }, (group: Group) => {
      console.log(group)
      const ballGroup = group.clone(true);
      ballGroup.castShadow = true;
      ballGroup.receiveShadow = true;
      (ballGroup.children[0] as Mesh).material && WebGLRendererSystem.instance.csm.setupMaterial((ballGroup.children[0] as Mesh).material);
      addComponent(entity, Object3DComponent, { value: ballGroup });
      Engine.scene.add(ballGroup);
      console.log('loaded golf ball model')
    });
  }

  const shapeHandle = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: { x: 0.05, y: 0.05, z: 0.25 } },
    config: {
      collisionLayer: GolfCollisionGroups.Club,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground
    }
  });
  const shapeHead = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: { x: 0.25, y: 0.2, z: 0.2 } },
    transform: new Transform({
      translation: { x: 0.25, y: 0.1, z: -1.7 }
    }),
    config: {
      collisionLayer: GolfCollisionGroups.Club,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground | GolfCollisionGroups.Hole
    }
  });

  const body = PhysicsSystem.instance.addBody(new Body({
    shapes: [shapeHandle, shapeHead],
    type:  BodyType.DYNAMIC,
    transform: {
      translation: { x: transform.position.x, y: transform.position.y, z: transform.position.z }
    }
  }));

  const collider = getMutableComponent(entity, ColliderComponent);
  collider.body = body;

  equipEntity(ownerNetworkObject.entity, entity, EquippableAttachmentPoint.RIGHT_HAND);
}

export const createGolfClubPrefab = ( args:{ parameters?: any, networkId?: number, uniqueId: string, ownerId?: string }) => {
  console.log('createGolfClubPrefab')
  initializeNetworkObject({
    prefabType: GolfPrefabTypes.Club,
    uniqueId: args.uniqueId,
    ownerId: args.ownerId,
    networkId: args.networkId,
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
      ]
    }
  });
}

// Prefab is a pattern for creating an entity and component collection as a prototype
export const GolfClubPrefab: NetworkPrefab = {
  initialize: createGolfClubPrefab,
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
      behavior: initializeGolfClub,
      networked: true
    }
  ],
  onBeforeDestroy: []
};
