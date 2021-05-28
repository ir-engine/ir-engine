
import { Entity } from '../../../../ecs/classes/Entity';
import { NetworkPrefab } from '../../../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { RigidBodyComponent } from '../../../../physics/components/RigidBody';
import { initializeNetworkObject } from '../../../../networking/functions/initializeNetworkObject';
import { GolfCollisionGroups, GolfPrefabTypes } from '../GolfGameConstants';
import { UserControlledColliderComponent } from '../../../../physics/components/UserControllerObjectComponent';
import { BoxBufferGeometry, DoubleSide, Group, Material, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { Engine } from '../../../../ecs/classes/Engine';
import { Body, BodyType, ColliderHitEvent, CollisionEvents, createShapeFromConfig, SceneQueryType, SHAPES, Transform } from 'three-physx';
import { CollisionGroups } from '../../../../physics/enums/CollisionGroups';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { Object3DComponent } from '../../../../scene/components/Object3DComponent';
import { GameObject } from '../../../components/GameObject';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { addComponent, getComponent, getMutableComponent } from '../../../../ecs/functions/EntityFunctions';
import { MathUtils } from 'three';
import { Network } from '../../../../networking/classes/Network';
import { isClient } from '../../../../common/functions/isClient';
import { getGame } from '../../../functions/functions';
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { GolfClubComponent } from '../components/GolfClubComponent';
import { getHandTransform } from '../../../../xr/functions/WebXRFunctions';
import { CharacterComponent } from '../../../../character/components/CharacterComponent';
import { setupSceneObjects } from '../../../../scene/functions/setupSceneObjects';

const vector0 = new Vector3();
const vector1 = new Vector3();
const vec3 = new Vector3();
const quat = new Quaternion();
const quat2 = new Quaternion();

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
      (obj.material as Material).opacity = enable ? 1 : 0.3;
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
  const { position, rotation } = handTransform;

  golfClubComponent.raycast.origin = { 
    x: position.x,
    y: position.y,
    z: position.z,
  }
  
  // TODO: fix three-physx internally to clone given vector instead of reference, keep 'new Vector3()' here for now
  golfClubComponent.raycast.direction = new Vector3(0, 0, -1).applyQuaternion(rotation);

  const hit = golfClubComponent.raycast.hits[0];
  const canHitBall = typeof hit !== 'undefined';
  if(canHitBall !== golfClubComponent.canHitBall) {
    enableClub(entityClub, canHitBall);
  }
  const headDistance = (hit ? hit.distance : clubLength) - 0.1;

  const collider = getMutableComponent(entityClub, ColliderComponent);
  const transform = getMutableComponent(entityClub, TransformComponent);

  // update position of club

  golfClubComponent.headGroup.position.setZ(-headDistance);
  golfClubComponent.neckObject.position.setZ(-headDistance * 0.5);
  golfClubComponent.neckObject.scale.setZ(headDistance * 0.5);

  golfClubComponent.meshGroup.getWorldQuaternion(quat);
  golfClubComponent.headGroup.quaternion.copy(quat).invert().multiply(actor.tiltContainer.quaternion);
  // golfClubComponent.headGroup.quaternion.copy(quat).invert().multiply(rotation);
  golfClubComponent.headGroup.updateMatrixWorld(true);

  transform.position.copy(position);
  transform.rotation.copy(rotation);

  // calculate velocity of the head of the golf club
  // average over multiple frames
  golfClubComponent.headGroup.getWorldPosition(vector1)
  vector0.subVectors(vector1, golfClubComponent.lastPositions[0])
  for(let i = 0; i < golfClubComponent.velocityPositionsToCalculate - 1; i++) {
    vector0.add(vector1.subVectors(golfClubComponent.lastPositions[i], golfClubComponent.lastPositions[i + 1]))
  }
  vector0.multiplyScalar(1 / (golfClubComponent.velocityPositionsToCalculate + 1));
  golfClubComponent.velocity.copy(vector0);
  golfClubComponent.body.transform.linearVelocity.copy(vector0);
  // now shift all previous positions down the list
  for(let i = golfClubComponent.velocityPositionsToCalculate - 1; i > 0; i--) {
    golfClubComponent.lastPositions[i].copy(golfClubComponent.lastPositions[i - 1]);
  }
  // add latest position to list
  golfClubComponent.headGroup.getWorldPosition(vector1)
  golfClubComponent.lastPositions[0].copy(vector1);

  // calculate relative rotation of club head
  quat.set(collider.body.transform.rotation.x, collider.body.transform.rotation.y, collider.body.transform.rotation.z, collider.body.transform.rotation.w)
  quat.invert().multiply(rotation)

  // TODO: make club head & collider flush to ground - need to use the normal


  // TODO: club head collider snaps to either side of the club to ensure a large enough collider and the contact position is directly on the club
  // need to add a minimum velocity for it to change sides, or to not 

  // // get velocity in local space
  // vector0.applyQuaternion(golfClubComponent.headGroup.getWorldQuaternion(quat2).invert())
  // golfClubComponent.swingVelocity = vector0.x

  // // get velocity of club head relative to parent
  // vector1.set(clubColliderSize.x * Math.sign(golfClubComponent.swingVelocity), 0, 0).applyQuaternion(golfClubComponent.headGroup.quaternion)

  collider.body.shapes[0].transform = {
    translation: golfClubComponent.headGroup.position,
    rotation: quat
  }
}

/**
* @author Josh Field <github.com/HexaField>
 */

const clubPowerMultiplier = 10;
const clubColliderSize = new Vector3(0.05, 0.2, 0.2);
const clubHalfWidth = 0.05;
const clubPutterLength = 0.1;
const clubLength = 2.5;

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
    const handleObject = new Mesh(new BoxBufferGeometry(clubHalfWidth, clubHalfWidth, 0.25), new MeshStandardMaterial({ color: 0xff2126, transparent: true }));
    golfClubComponent.handleObject = handleObject;
    
    const headGroup = new Group();
    const headObject = new Mesh(new BoxBufferGeometry(clubHalfWidth, clubHalfWidth, clubPutterLength * 2), new MeshStandardMaterial({ color: 0x2126ff , transparent: true }));
    // raise the club by half it's height and move it out by half it's length so it's flush to ground and attached at end
    headObject.position.set(0, clubHalfWidth, clubPutterLength * 0.5);
    headGroup.add(headObject);
    golfClubComponent.headGroup = headGroup;

    const neckObject = new Mesh(new BoxBufferGeometry(clubHalfWidth * 0.5, clubHalfWidth * 0.5, -1.75), new MeshStandardMaterial({ color: 0x21ff26, transparent: true, side: DoubleSide }));
    golfClubComponent.neckObject = neckObject;

    const meshGroup = new Group();
    meshGroup.add(handleObject, headGroup, neckObject);
    golfClubComponent.meshGroup = meshGroup;
    
    setupSceneObjects(meshGroup);

    addComponent(entity, Object3DComponent, { value: meshGroup });
    Engine.scene.add(meshGroup); 
  }

  const shapeHead = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: clubColliderSize },
    config: {
      isTrigger: true,
      collisionLayer: GolfCollisionGroups.Club,
      collisionMask: GolfCollisionGroups.Ball// | CollisionGroups.Ground
    }
  });

  const body = PhysicsSystem.instance.addBody(new Body({
    shapes: [shapeHead],
    type: BodyType.KINEMATIC,
    transform: {
      translation: { x: transform.position.x, y: transform.position.y, z: transform.position.z }
    }
  }));

  const collider = getMutableComponent(entity, ColliderComponent);
  collider.body = body;
  golfClubComponent.body = body;

  for(let i = 0; i < golfClubComponent.velocityPositionsToCalculate; i++) {
    golfClubComponent.lastPositions[i] = new Vector3();
  }
  golfClubComponent.velocity = new Vector3();
  
  // https://github.com/PersoSirEduard/OculusQuest-Godot-MiniGolfGame/blob/master/Scripts/GolfClub/GolfClub.gd#L18
  
  let hasBeenHit = false
  // temporary, once it's all working this will be a game mode behavior
  body.addEventListener(CollisionEvents.TRIGGER_START, (ev: ColliderHitEvent) => {
    if(!golfClubComponent.canHitBall) return;
    const otherEntity = ev.bodyOther.userData as Entity;
    if(typeof otherEntity === 'undefined') return
    const ballObject = getComponent<GameObject>(otherEntity, GameObject)
    if(!ballObject || ballObject.role !== 'GolfBall') return;
    if(hasBeenHit) return;
    // this is to ensure we dont have mutliple hits in a single swing, when we have 'turns' set up this can be removed
    hasBeenHit = true;
    setTimeout(() => {
      hasBeenHit = false
    }, 500)
    // undo our delta so we get our transform velocity in units/second instead of units/frame
    // const clampedDelta = Math.max(1/30, Math.min(Engine.delta, 1/120)) * 1000;
    // force is in kg, we need it in grams, so x1000
    const velocityMultiplier = clubPowerMultiplier * 1000;
    (ev.bodyOther as any).addForce({
      x: golfClubComponent.velocity.x * velocityMultiplier,
      y: golfClubComponent.canDoChipShots ? golfClubComponent.velocity.y * velocityMultiplier : 0, // lock to XZ plane if we disable chip shots
      z: golfClubComponent.velocity.z * velocityMultiplier,
    })
  })

  // equipEntity(ownerNetworkObject.entity, entity, EquippableAttachmentPoint.RIGHT_HAND);
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
