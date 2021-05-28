
import { Entity } from '../../../../ecs/classes/Entity';
import { NetworkPrefab } from '../../../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { RigidBodyComponent } from '../../../../physics/components/RigidBody';
import { initializeNetworkObject } from '../../../../networking/functions/initializeNetworkObject';
import { GolfCollisionGroups, GolfPrefabTypes } from '../GolfGameConstants';
import { UserControlledColliderComponent } from '../../../../physics/components/UserControllerObjectComponent';
import { BoxBufferGeometry, Group, Material, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { Engine } from '../../../../ecs/classes/Engine';
import { Body, BodyType, ColliderHitEvent, CollisionEvents, createShapeFromConfig, SceneQueryType, SHAPES, Transform } from 'three-physx';
import { CollisionGroups } from '../../../../physics/enums/CollisionGroups';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { Object3DComponent } from '../../../../scene/components/Object3DComponent';
import { WebGLRendererSystem } from '../../../../renderer/WebGLRendererSystem';
import { GameObject } from '../../../components/GameObject';
import { equipEntity } from '../../../../interaction/functions/equippableFunctions';
import { EquippableAttachmentPoint } from '../../../../interaction/enums/EquippedEnums';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { addComponent, getComponent, getMutableComponent } from '../../../../ecs/functions/EntityFunctions';
import { MathUtils } from 'three';
import { Network } from '../../../../networking/classes/Network';
import { isClient } from '../../../../common/functions/isClient';
import { getGame } from '../../../functions/functions';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { GolfClubComponent } from '../components/GolfClubComponent';
import { EquippedComponent } from '../../../../interaction/components/EquippedComponent';
import { getHandTransform } from '../../../../xr/functions/WebXRFunctions';
import { ParityValue } from '../../../../common/enums/ParityValue';
import { CharacterComponent } from '../../../../character/components/CharacterComponent';

const vec3 = new Vector3();
const quat = new Quaternion();
const clubLength = 2;

/**
 * @author Josh Field <github.com/HexaField>
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

export const enableClub = (entityClub: Entity, enable: boolean): void => {
  const golfClubComponent = getMutableComponent(entityClub, GolfClubComponent);
  golfClubComponent.canHitBall = enable;
  golfClubComponent.meshGroup.traverse((obj: Mesh) => {
    if(obj.material) {
      (obj.material as Material).opacity = enable ? 1 : 0.4;
    }
  })
}

/**
* @author Josh Field <github.com/HexaField>
 */

export const updateClub: Behavior = (entityClub: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  if(!isClient) return;
  // only need to update club if it's our own
  if(getComponent(entityClub, UserControlledColliderComponent).ownerNetworkId !== Network.instance.localAvatarNetworkId) return;

  const golfClubComponent = getMutableComponent(entityClub, GolfClubComponent);

  const ownerEntity = Network.instance.networkObjects[getComponent(entityClub, UserControlledColliderComponent).ownerNetworkId].component.entity;
  const actor = getComponent(ownerEntity, CharacterComponent);

  const handTransform = getHandTransform(ownerEntity);
  if(!handTransform) return;

  const { position, rotation } = handTransform;
  golfClubComponent.raycast.origin = { 
    x: position.x,
    y: position.y,
    z: position.z,
  }
  golfClubComponent.raycast.direction = vec3.set(0, 0, 1).applyQuaternion(rotation);

  const hit = golfClubComponent.raycast.hits[0];
  golfClubComponent.canHitBall = typeof hit !== 'undefined';
  const headDistance = (hit ? hit.distance : clubLength) - 0.1;
  
  golfClubComponent.headGroup.position.setZ(-headDistance);
  golfClubComponent.neckObject.position.setZ(-headDistance * 0.5);
  golfClubComponent.neckObject.scale.setZ(headDistance * 0.5);

  golfClubComponent.headGroup.getWorldQuaternion(quat);
  golfClubComponent.headGroup.children[0].quaternion.copy(quat).invert().multiply(actor.tiltContainer.quaternion);
  golfClubComponent.headGroup.updateMatrixWorld(true);

  // TODO: fix collider
  // const collider = getMutableComponent(entityClub, ColliderComponent);
  // const transform = getMutableComponent(entityClub, TransformComponent);
  // transform.position = golfClubComponent.meshGroup.getWorldPosition(vec3);
  // transform.rotation = golfClubComponent.meshGroup.getWorldQuaternion(quat);
  // collider.body.shapes[0].transform.translation = golfClubComponent.headGroup.position;
  // collider.body.shapes[0].transform.rotation = golfClubComponent.headGroup.quaternion;
}

/**
* @author Josh Field <github.com/HexaField>
 */

const clubPowerMultiplier = 1;

export const initializeGolfClub = (entity: Entity) => {
  // its transform was set in createGolfClubPrefab from parameters (its transform Golf Tee);
  const transform = getComponent(entity, TransformComponent);

  const networkObject = getComponent(entity, NetworkObject);
  const ownerNetworkObject = Object.values(Network.instance.networkObjects).find((obj) => {
      return obj.ownerId === networkObject.ownerId;
  }).component;
  addComponent(entity, UserControlledColliderComponent, { ownerNetworkId: ownerNetworkObject.networkId });

  const golfClubComponent = getMutableComponent(entity, GolfClubComponent);

  // only raycast if it's our own club
  if(ownerNetworkObject.networkId === Network.instance.localAvatarNetworkId) {
    golfClubComponent.raycast = PhysicsSystem.instance.addRaycastQuery({ 
      type: SceneQueryType.Closest,
      origin: new Vector3(),
      direction: new Vector3(0, -1, 0),
      maxDistance: clubLength,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground,
    });
  }

  if(isClient) {
    const handleObject = new Mesh(new BoxBufferGeometry(0.05, 0.05, 0.25), new MeshStandardMaterial({ color: 0xff2126 }));
    WebGLRendererSystem.instance.csm.setupMaterial(handleObject.material);
    golfClubComponent.handleObject = handleObject;
    
    const headGroup = new Group();
    const headObject = new Mesh(new BoxBufferGeometry(0.05, 0.05, 0.1), new MeshStandardMaterial({ color: 0x2126ff }));
    WebGLRendererSystem.instance.csm.setupMaterial(headObject.material);
    headObject.position.set(0, 0.1, 0);
    headGroup.position.set(0, -0.05, 0);
    headGroup.add(headObject);
    golfClubComponent.headGroup = headGroup;

    const neckObject = new Mesh(new BoxBufferGeometry(0.025, 0.025, -1.75), new MeshStandardMaterial({ color: 0x21ff26 }));
    WebGLRendererSystem.instance.csm.setupMaterial(handleObject.material);
    golfClubComponent.neckObject = neckObject;

    const meshGroup = new Group();
    meshGroup.add(handleObject, headGroup, neckObject);
    golfClubComponent.meshGroup = meshGroup;
    
    addComponent(entity, Object3DComponent, { value: meshGroup });
    Engine.scene.add(meshGroup);
  }

  // if(isClient) {
  //   AssetLoader.load({
  //     url: Engine.publicPath + '/models/golf/golf_club.glb',
  //   }, (group: Group) => {
  //     const ballGroup = group.clone(true);
  //     ballGroup.castShadow = true;
  //     ballGroup.receiveShadow = true;
  //     (ballGroup.children[0] as Mesh).material && WebGLRendererSystem.instance.csm.setupMaterial((ballGroup.children[0] as Mesh).material);
  //     addComponent(entity, Object3DComponent, { value: ballGroup });
  //     Engine.scene.add(ballGroup);
  //   });
  // }

  const shapeHead = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: { x: 0.25, y: 0.2, z: 0.2 } },
    transform: new Transform({
      translation: { x: 0.25, y: 0.1, z: -1.7 }
    }),
    config: {
      isTrigger: true,
      collisionLayer: GolfCollisionGroups.Club,
      collisionMask: GolfCollisionGroups.Ball// | CollisionGroups.Ground
    }
  });

  const body = PhysicsSystem.instance.addBody(new Body({
    shapes: [shapeHead],
    type:  BodyType.DYNAMIC,
    transform: {
      translation: { x: transform.position.x, y: transform.position.y, z: transform.position.z }
    }
  }));

  const collider = getMutableComponent(entity, ColliderComponent);
  collider.body = body;
  
  // https://github.com/PersoSirEduard/OculusQuest-Godot-MiniGolfGame/blob/master/Scripts/GolfClub/GolfClub.gd#L18
  
  let hasBeenHit = false
  // temporary, once it's all working this will be a game mode behavior
  body.addEventListener(CollisionEvents.TRIGGER_START, (ev: ColliderHitEvent) => {
    if(!golfClubComponent.canHitBall) return;
    if(hasBeenHit) return;
    // this is to ensure we dont have mutliple hits in a single swing, when we have 'turns' set up this can be removed
    hasBeenHit = true;
    setTimeout(() => {
      hasBeenHit = false
    }, 500)
    const otherEntity = ev.bodyOther.userData as Entity;
    if(typeof otherEntity === 'undefined') return
    const ballObject = getComponent<GameObject>(otherEntity, GameObject)
    if(!ballObject || ballObject.role !== 'GolfBall') return;
    // undo our delta so we get our transform velocity in units/second instead of units/frame
    const clampedDelta = Math.max(1/30, Math.min(Engine.delta, 1/120)) * 1000;
    // force is in kg, we need it in grams, so x1000
    const velocityMultiplier = clampedDelta * clubPowerMultiplier * 1000;
    (ev.bodyOther as any).addForce({
      x: ev.bodySelf.transform.linearVelocity.x * velocityMultiplier,
      y: golfClubComponent.canDoChipShots ? ev.bodySelf.transform.linearVelocity.y * velocityMultiplier : 0, // lock to XZ plane if we disable chip shots
      z: ev.bodySelf.transform.linearVelocity.z * velocityMultiplier,
    })
  })

  equipEntity(ownerNetworkObject.entity, entity, EquippableAttachmentPoint.RIGHT_HAND);
}

export const createGolfClubPrefab = ( args:{ parameters?: any, networkId?: number, uniqueId: string, ownerId?: string }) => {
  console.log('createGolfClubPrefab')
  initializeNetworkObject({
    prefabType: GolfPrefabTypes.Club,
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
    { type: GameObject },
    { type: GolfClubComponent }
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
