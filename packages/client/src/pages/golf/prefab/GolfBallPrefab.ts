import { Color, Group, Material, MathUtils, Mesh, MeshBasicMaterial, Quaternion, Vector3, Vector4 } from 'three'
import { Body, BodyType, ShapeType, SHAPES, RaycastQuery, SceneQueryType, PhysXInstance } from 'three-physx'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { isEntityLocalClient } from '@xrengine/engine/src/networking/functions/isEntityLocalClient'
import { spawnPrefab } from '@xrengine/engine/src/networking/functions/spawnPrefab'
import { ClientAuthoritativeComponent } from '@xrengine/engine/src/physics/components/ClientAuthoritativeComponent'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
import { CollisionGroups } from '@xrengine/engine/src/physics/enums/CollisionGroups'
import TrailRenderer from '@xrengine/engine/src/scene/classes/TrailRenderer'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { GolfBallComponent } from '../components/GolfBallComponent'
import { getGolfPlayerNumber } from '../functions/golfFunctions'
import { GolfCollisionGroups, GolfColours, GolfPrefabTypes } from '../GolfGameConstants'
import { getTee, GolfState } from '../GolfSystem'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { ECSWorld } from '@xrengine/engine/src/ecs/classes/World'
import { NetworkObjectComponentOwner } from '@xrengine/engine/src/networking/components/NetworkObjectComponentOwner'

/**
 * @author Josh Field <github.com/HexaField>
 */

export enum BALL_STATES {
  INACTIVE,
  WAITING,
  MOVING,
  IN_HOLE,
  STOPPED
}

interface BallGroupType extends Group {
  userData: {
    meshObject: Mesh
    trailObject: TrailRenderer
    lastTrailUpdateTime: number
  }
}

export const setBallState = (entityBall: Entity, ballState: BALL_STATES) => {
  const golfBallComponent = getComponent(entityBall, GolfBallComponent)
  console.log('setBallState', golfBallComponent.number, Object.values(BALL_STATES)[ballState])
  golfBallComponent.state = ballState

  if (isClient) {
    const ballGroup = getComponent(entityBall, Object3DComponent).value as BallGroupType
    switch (ballState) {
      case BALL_STATES.INACTIVE: {
        const collider = getComponent(entityBall, ColliderComponent)
        collider?.body.updateTransform({
          rotation: new Quaternion()
        })
        // hide ball
        ballGroup.quaternion.identity()
        if (GolfState.players.value[golfBallComponent.number].stroke === 0) {
          ballGroup.visible = false
        }
        ballGroup.userData.trailObject.visible = false
        ballGroup.userData.meshObject.scale.set(0.5, 0.01, 0.5)
        ballGroup.userData.meshObject.position.y = -(golfBallRadius * 0.5)
        return
      }
      case BALL_STATES.WAITING: {
        // show ball
        ballGroup.visible = true
        ballGroup.userData.trailObject.visible = true
        ballGroup.userData.meshObject.scale.setScalar(1)
        ballGroup.userData.meshObject.position.y = 0
        return
      }
      case BALL_STATES.MOVING: {
        return
      }
      case BALL_STATES.IN_HOLE: {
        return
      }
      case BALL_STATES.STOPPED: {
        return
      }
    }
  }
}

export const resetBall = (entityBall: Entity, position: number[]) => {
  const collider = getComponent(entityBall, ColliderComponent)
  if (collider) {
    collider.body.updateTransform({
      translation: new Vector3(...position),
      rotation: new Quaternion()
    })
  } else {
    const transform = getComponent(entityBall, TransformComponent)
    transform.position.fromArray(position)
  }
  const velocity = getComponent(entityBall, VelocityComponent)
  velocity.velocity.copy(new Vector3())
}

export const spawnBall = (world: ECSWorld, entityPlayer: Entity, playerCurrentHole: number): void => {
  const playerNetworkObject = getComponent(entityPlayer, NetworkObjectComponent)

  const networkId = Network.getNetworkId()
  const uuid = MathUtils.generateUUID()

  const teeEntity = getTee(world, playerCurrentHole)
  const teeTransform = getComponent(teeEntity, TransformComponent)

  const parameters: GolfBallSpawnParameters = {
    spawnPosition: new Vector3().copy(teeTransform.position),
    ownerNetworkId: playerNetworkObject.networkId,
    playerNumber: getGolfPlayerNumber(entityPlayer)
  }

  // this spawns the ball on the server
  spawnPrefab(GolfPrefabTypes.Ball, uuid, networkId, parameters)

  // this sends the ball to the clients
  Network.instance.worldState.createObjects.push({
    networkId,
    uniqueId: uuid,
    prefabType: GolfPrefabTypes.Ball,
    parameters
  })
}

/**
 * @author Josh Field <github.com/HexaField>
 */

export const updateBall = (entityBall: Entity): void => {
  const collider = getComponent(entityBall, ColliderComponent)
  const ballPosition = collider.body.transform.translation
  const golfBallComponent = getComponent(entityBall, GolfBallComponent)
  golfBallComponent.groundRaycast.origin.copy(ballPosition)

  if (isClient) {
    const ballGroup = getComponent(entityBall, Object3DComponent).value as BallGroupType
    const trail = ballGroup.userData.trailObject

    const time = Date.now()
    if (time - ballGroup.userData.lastTrailUpdateTime > 10) {
      trail.advance()
      ballGroup.userData.lastTrailUpdateTime = time
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

function assetLoadCallback(group: Group, ballEntity: Entity, ownerPlayerNumber: number) {
  const color = GolfColours[ownerPlayerNumber]
  console.log(group)

  // its transform was set in createGolfBallPrefab from parameters (its transform Golf Tee);
  const transform = getComponent(ballEntity, TransformComponent)
  const nameComponent = getComponent(ballEntity, NameComponent)
  const ballMesh = group.children[0].clone(true) as Mesh
  ballMesh.name = 'Ball' + nameComponent.uuid
  ballMesh.castShadow = true
  ballMesh.receiveShadow = true
  ballMesh.traverse((obj: Mesh) => {
    obj.position.set(0, 0, 0)
    obj.scale.set(1, 1, 1)
    if (obj.material) {
      obj.material = (obj.material as Material).clone()
      ;(obj.material as MeshBasicMaterial).color.copy(color)
    }
  })
  const ballGroup = new Group() as BallGroupType
  ballGroup.add(ballMesh)
  addComponent(ballEntity, Object3DComponent, { value: ballGroup })
  ballGroup.userData.meshObject = ballMesh

  // Add trail effect
  const trailHeadGeometry = []
  trailHeadGeometry.push(new Vector3(-1.0, 0.0, 0.0), new Vector3(0.0, 0.0, 0.0), new Vector3(1.0, 0.0, 0.0))
  const trailObject = new TrailRenderer(false)
  const trailMaterial = TrailRenderer.createBaseMaterial()
  const colorVec4 = new Vector4().fromArray([...new Color(color).toArray(), 1])
  trailMaterial.uniforms.headColor.value = colorVec4
  trailMaterial.uniforms.tailColor.value = colorVec4
  const trailLength = 50
  trailObject.initialize(trailMaterial, trailLength, false, 0, trailHeadGeometry, ballGroup)
  Engine.scene.add(trailObject)
  ballGroup.userData.trailObject = trailObject
  ballGroup.userData.lastTrailUpdateTime = Date.now()
}

type GolfBallSpawnParameters = {
  spawnPosition: Vector3
  ownerNetworkId: number
  playerNumber: number
}

export const initializeGolfBall = (ballEntity: Entity, ownerEntity: Entity, parameters: GolfBallSpawnParameters) => {
  console.log('initializeGolfBall', ballEntity, ownerEntity, parameters)
  const { spawnPosition, playerNumber } = parameters
  const ownerNetworkId = getComponent(ownerEntity, NetworkObjectComponent).networkId

  const transform = addComponent(ballEntity, TransformComponent, {
    position: new Vector3(spawnPosition.x, spawnPosition.y + golfBallRadius, spawnPosition.z),
    rotation: new Quaternion(),
    scale: new Vector3().setScalar(golfBallRadius)
  })
  addComponent(ballEntity, VelocityComponent, { velocity: new Vector3() })
  addComponent(ballEntity, NameComponent, { name: `GolfBall-${playerNumber}` })
  addComponent(ballEntity, NetworkObjectComponentOwner, { networkId: ownerNetworkId })

  if (isClient) {
    // addComponent(ballEntity, InterpolationComponent, {})
    const gltf = AssetLoader.getFromCache(Engine.publicPath + '/models/golf/golf_ball.glb')
    assetLoadCallback(gltf.scene, ballEntity, playerNumber)
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

  const isMyBall = isEntityLocalClient(ownerEntity)

  const body = PhysXInstance.instance.addBody(
    new Body({
      shapes: [shape],
      // make static on server and remote player's balls so we can still detect collision with hole
      type: isMyBall ? BodyType.DYNAMIC : BodyType.STATIC,
      transform: {
        translation: { x: transform.position.x, y: transform.position.y, z: transform.position.z }
      },
      userData: { entity: ballEntity }
    })
  )
  addComponent(ballEntity, ColliderComponent, { body })

  // for track ground
  const groundRaycast = PhysXInstance.instance.addRaycastQuery(
    new RaycastQuery({
      type: SceneQueryType.Closest,
      origin: transform.position,
      direction: new Vector3(0, -1, 0),
      maxDistance: 1,
      collisionMask: GolfCollisionGroups.Course
    })
  )

  // for track wall
  const wallRaycast = PhysXInstance.instance.addRaycastQuery(
    new RaycastQuery({
      type: SceneQueryType.Closest,
      origin: transform.position,
      direction: new Vector3(0, 0, 0),
      maxDistance: 0.5,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground | GolfCollisionGroups.Course
    })
  )

  addComponent(ballEntity, GolfBallComponent, {
    groundRaycast,
    wallRaycast,
    state: BALL_STATES.INACTIVE,
    number: playerNumber
  })
  if (!isClient || isMyBall) {
    addComponent(ballEntity, ClientAuthoritativeComponent, { ownerNetworkId })
  }
}
