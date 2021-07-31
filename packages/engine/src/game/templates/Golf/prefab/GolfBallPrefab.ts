import { Color, Group, MathUtils, Mesh, MeshPhongMaterial, Vector3, Vector4 } from 'three'
import { Body, BodyType, ShapeType, SHAPES, RaycastQuery, SceneQueryType, PhysXInstance } from 'three-physx'
import { AssetLoader } from '../../../../assets/classes/AssetLoader'
import { isClient } from '../../../../common/functions/isClient'
import { Behavior } from '../../../../common/interfaces/Behavior'
import { Engine } from '../../../../ecs/classes/Engine'
import { Entity } from '../../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent
} from '../../../../ecs/functions/EntityFunctions'
import { Network } from '../../../../networking/classes/Network'
import { NetworkObject } from '../../../../networking/components/NetworkObject'
import { NetworkObjectOwner } from '../../../../networking/components/NetworkObjectOwner'
import { initializeNetworkObject } from '../../../../networking/functions/initializeNetworkObject'
import { NetworkPrefab } from '../../../../networking/interfaces/NetworkPrefab'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { InterpolationComponent } from '../../../../physics/components/InterpolationComponent'
import { LocalInterpolationComponent } from '../../../../physics/components/LocalInterpolationComponent'
import { RigidBodyComponent } from '../../../../physics/components/RigidBody'
import { CollisionGroups } from '../../../../physics/enums/CollisionGroups'
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem'
import TrailRenderer from '../../../../scene/classes/TrailRenderer'
import { Object3DComponent } from '../../../../scene/components/Object3DComponent'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GameObject } from '../../../components/GameObject'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGame } from '../../../functions/functions'
import { applyHideOrVisibleState } from '../behaviors/hideUnhideBall'
import { GolfBallComponent } from '../components/GolfBallComponent'
import { GolfCollisionGroups, GolfColours, GolfPrefabTypes } from '../GolfGameConstants'

/**
 * @author Josh Field <github.com/HexaField>
 */

export const spawnBall: Behavior = (
  entityPlayer: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  // server sends clients the entity data
  if (isClient) return
  console.warn('SpawnBall')

  const game = getGame(entityPlayer)
  const playerNetworkObject = getComponent(entityPlayer, NetworkObject)

  const networkId = Network.getNetworkId()
  const uuid = MathUtils.generateUUID()
  // send position to spawn
  // now we have just one location
  // but soon
  const teeEntity = game.gameObjects[args.positionCopyFromRole][0]
  const teeTransform = getComponent(teeEntity, TransformComponent)

  const parameters: GolfBallSpawnParameters = {
    gameName: game.name,
    role: 'GolfBall',
    spawnPosition: new Vector3(
      teeTransform.position.x,
      teeTransform.position.y + args.offsetY,
      teeTransform.position.z
    ),
    uuid,
    ownerNetworkId: playerNetworkObject.networkId
  }

  // this spawns the ball on the server
  createGolfBallPrefab({
    networkId,
    uniqueId: uuid,
    ownerId: playerNetworkObject.ownerId, // the uuid of the player whose ball this is
    parameters
  })

  // this sends the ball to the clients
  Network.instance.worldState.createObjects.push({
    networkId,
    ownerId: playerNetworkObject.ownerId,
    uniqueId: uuid,
    prefabType: GolfPrefabTypes.Ball,
    parameters
  })
}

/**
 * @author Josh Field <github.com/HexaField>
 */

export const updateBall: Behavior = (
  entityBall: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  if (isClient) {
    const obj = getComponent(entityBall, Object3DComponent)
    if (!obj?.value) return
    const trail = obj.value.userData.trailObject as TrailRenderer

    const time = Date.now()
    if (time - obj.value.userData.lastTrailUpdateTime > 10) {
      trail.advance()
      obj.value.userData.lastTrailUpdateTime = time
    } else {
      trail.updateHead()
    }
  }
}

/**
 * @author Josh Field <github.com/HexaField>
 */

const golfBallRadius = 0.03
const golfBallColliderExpansion = 0.01

function assetLoadCallback(group: Group, ballEntity: Entity) {
  const ownerNetworkId = getComponent(ballEntity, NetworkObjectOwner).networkId
  const ownerEntity = Network.instance.networkObjects[ownerNetworkId].component.entity
  const ownerPlayerNumber = Number(getComponent(ownerEntity, GamePlayer).role.substr(0, 1)) - 1

  const color = GolfColours[ownerPlayerNumber]

  // its transform was set in createGolfBallPrefab from parameters (its transform Golf Tee);
  const transform = getComponent(ballEntity, TransformComponent)
  const gameObject = getComponent(ballEntity, GameObject)
  const ballMesh = group.children[0].clone(true) as Mesh
  ballMesh.name = 'Ball' + gameObject.uuid
  ballMesh.position.copy(transform.position)
  ballMesh.scale.copy(transform.scale)
  ballMesh.castShadow = true
  ballMesh.receiveShadow = true
  addComponent(ballEntity, Object3DComponent, { value: ballMesh })
  // after because break trail
  applyHideOrVisibleState(ballEntity)

  // Add trail effect

  const trailHeadGeometry = []
  trailHeadGeometry.push(new Vector3(-1.0, 0.0, 0.0), new Vector3(0.0, 0.0, 0.0), new Vector3(1.0, 0.0, 0.0))
  const trailObject = new TrailRenderer(false)
  const trailMaterial = TrailRenderer.createBaseMaterial()
  const colorVec4 = new Vector4().fromArray([...new Color(color).toArray(), 1])
  trailMaterial.uniforms.headColor.value = colorVec4
  trailMaterial.uniforms.tailColor.value = colorVec4
  const trailLength = 50
  trailObject.initialize(trailMaterial, trailLength, false, 0, trailHeadGeometry, ballMesh)
  Engine.scene.add(trailObject)
  ballMesh.userData.trailObject = trailObject
  ballMesh.userData.lastTrailUpdateTime = Date.now()
}

export const initializeGolfBall = (ballEntity: Entity) => {
  // its transform was set in createGolfBallPrefab from parameters (its transform Golf Tee);
  const transform = getComponent(ballEntity, TransformComponent)

  if (isClient) {
    AssetLoader.load(
      {
        url: Engine.publicPath + '/models/golf/golf_ball.glb'
      },
      (group: Group) => {
        assetLoadCallback(group, ballEntity)
      }
    )
  }

  const shape: ShapeType = {
    shape: SHAPES.Sphere,
    options: { radius: golfBallRadius + golfBallColliderExpansion },
    config: {
      // we add a rest offset to make the contact detection of the ball bigger, without making the actual size of the ball bigger
      restOffset: -golfBallColliderExpansion,
      // we mostly reverse the expansion for contact detection (so the ball rests on the ground)
      // this will not reverse the expansion for trigger colliders
      contactOffset: golfBallColliderExpansion,
      material: { staticFriction: 0.2, dynamicFriction: 0.2, restitution: 0.9 },
      collisionLayer: GolfCollisionGroups.Ball,
      collisionMask:
        CollisionGroups.Default | CollisionGroups.Ground | GolfCollisionGroups.Course | GolfCollisionGroups.Hole
    }
  }

  const body = PhysXInstance.instance.addBody(
    new Body({
      shapes: [shape],
      type: BodyType.DYNAMIC,
      transform: {
        translation: { x: transform.position.x, y: transform.position.y, z: transform.position.z }
      },
      userData: ballEntity
    })
  )

  addComponent(ballEntity, ColliderComponent, { body })

  const golfBallComponent = getMutableComponent(ballEntity, GolfBallComponent)
  const ballPosition = getComponent(ballEntity, ColliderComponent).body.transform.translation

  // for track ground
  golfBallComponent.groundRaycast = PhysXInstance.instance.addRaycastQuery(
    new RaycastQuery({
      type: SceneQueryType.Closest,
      origin: ballPosition,
      direction: new Vector3(0, -1, 0),
      maxDistance: 0.5,
      collisionMask: GolfCollisionGroups.Course
    })
  )

  // for track wall
  golfBallComponent.wallRaycast = PhysXInstance.instance.addRaycastQuery(
    new RaycastQuery({
      type: SceneQueryType.Closest,
      origin: ballPosition,
      direction: new Vector3(0, 0, 0),
      maxDistance: 0.5,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground | GolfCollisionGroups.Course
    })
  )
}

type GolfBallSpawnParameters = {
  gameName: string
  role: string
  uuid: string
  ownerNetworkId?: number
  spawnPosition: Vector3
}

export const createGolfBallPrefab = (args: {
  parameters?: GolfBallSpawnParameters
  networkId?: number
  uniqueId: string
  ownerId?: string
}) => {
  console.log('createGolfBallPrefab', args)
  initializeNetworkObject({
    prefabType: GolfPrefabTypes.Ball,
    uniqueId: args.uniqueId,
    ownerId: args.ownerId,
    networkId: args.networkId,
    parameters: args.parameters,
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
            position: new Vector3(
              args.parameters.spawnPosition.x,
              args.parameters.spawnPosition.y + golfBallRadius,
              args.parameters.spawnPosition.z
            ),
            scale: new Vector3().setScalar(golfBallRadius)
          }
        },
        {
          type: NetworkObjectOwner,
          data: {
            networkId: args.parameters.ownerNetworkId
          }
        }
      ]
    }
  })
}

// Prefab is a pattern for creating an entity and component collection as a prototype
export const GolfBallPrefab: NetworkPrefab = {
  //@ts-ignore
  initialize: createGolfBallPrefab,
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    { type: RigidBodyComponent },
    { type: GameObject },
    { type: NetworkObjectOwner },
    { type: GolfBallComponent }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [{ type: LocalInterpolationComponent }],
  clientComponents: [{ type: InterpolationComponent }],
  serverComponents: [],
  onAfterCreate: [],
  onBeforeDestroy: []
}
