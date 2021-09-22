import {
  Color,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Quaternion,
  Vector3,
  Vector4,
  ConeGeometry
} from 'three'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { isEntityLocalClient } from '@xrengine/engine/src/networking/functions/isEntityLocalClient'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
import { CollisionGroups } from '@xrengine/engine/src/physics/enums/CollisionGroups'
import TrailRenderer from '@xrengine/engine/src/scene/classes/TrailRenderer'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { GolfBallComponent } from '../components/GolfBallComponent'
import { getGolfPlayerNumber } from '../functions/golfFunctions'
import { GolfCollisionGroups, GolfColours } from '../GolfGameConstants'
import { GolfState } from '../GolfSystem'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { OffScreenIndicator } from '@xrengine/engine/src/scene/classes/OffScreenIndicator'
import { SoundEffect } from '@xrengine/engine/src/audio/components/SoundEffect'
import { PlaySoundEffect } from '@xrengine/engine/src/audio/components/PlaySoundEffect'
import { GolfAction } from '../GolfAction'
import { getHolePosition } from '../functions/golfBotHookFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { BodyType, ColliderHitEvent, SceneQueryType } from '@xrengine/engine/src/physics/types/PhysicsTypes'
import { RaycastComponentType } from '@xrengine/engine/src/physics/components/RaycastComponent'
import { CollisionComponent } from '@xrengine/engine/src/physics/components/CollisionComponent'

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
    indicatorMesh: Mesh
    offscreenIndicatorMesh: Mesh
    offscreenIndicator: OffScreenIndicator
    lastTrailUpdateTime: number
  }
}

enum BALL_SFX {
  HIT,
  IN_HOLE,
  HIT_WALL
}

export const setBallState = (entityBall: Entity, ballState: BALL_STATES) => {
  if (typeof entityBall === 'undefined') return
  const golfBallComponent = getComponent(entityBall, GolfBallComponent)
  console.log('setBallState', golfBallComponent.number, Object.values(BALL_STATES)[ballState])
  golfBallComponent.state = ballState

  if (isClient) {
    const ballGroup = getComponent(entityBall, Object3DComponent).value as BallGroupType
    switch (ballState) {
      case BALL_STATES.INACTIVE: {
        // hide ball
        ballGroup.quaternion.identity()
        if (GolfState.players.value[golfBallComponent.number].stroke === 0) {
          ballGroup.visible = false
        }
        ballGroup.userData.trailObject.visible = false
        ballGroup.userData.meshObject.scale.set(0.5, 0.01, 0.5)
        ballGroup.userData.meshObject.position.y = -(golfBallRadius * 0.5)

        ballGroup.userData.indicatorMesh.visible = false
        ballGroup.userData.offscreenIndicatorMesh.visible = false
        return
      }
      case BALL_STATES.WAITING: {
        // show ball
        ballGroup.visible = true
        ballGroup.userData.trailObject.visible = true
        ballGroup.userData.meshObject.scale.setScalar(1)
        ballGroup.userData.meshObject.position.y = 0

        ballGroup.userData.indicatorMesh.visible = true
        return
      }
      case BALL_STATES.MOVING: {
        // TODO: Fine tune volume
        playVelocityBasedSFX(entityBall, BALL_SFX.HIT, 1, 3.5, 0.2, 1)
        ballGroup.userData.indicatorMesh.visible = false
        return
      }
      case BALL_STATES.IN_HOLE: {
        addComponent(entityBall, PlaySoundEffect, { index: BALL_SFX.IN_HOLE, volume: 1 })
        return
      }
      case BALL_STATES.STOPPED: {
        ballGroup.userData.indicatorMesh.visible = true
        return
      }
    }
  }
}

export const resetBall = (entityBall: Entity, position: number[]) => {
  const collider = getComponent(entityBall, ColliderComponent)
  if (collider) {
    collider.body.setGlobalPose(
      {
        translation: new Vector3(...position),
        rotation: new Quaternion()
      },
      true
    )
    collider.body.setLinearVelocity({ x: 0, y: 0, z: 0 }, true)
    collider.body.setAngularVelocity({ x: 0, y: 0, z: 0 }, true)
  } else {
    const transform = getComponent(entityBall, TransformComponent)
    transform.position.fromArray(position)
  }
  const velocity = getComponent(entityBall, VelocityComponent)
  velocity.velocity.copy(new Vector3())
}

// export const spawnBall = (entityPlayer: Entity, playerCurrentHole: number): void => {
//   const playerNetworkObject = getComponent(entityPlayer, NetworkObjectComponent)

//   const teeEntity = getTee(playerCurrentHole)
//   const teeTransform = getComponent(teeEntity, TransformComponent)

//   const parameters: GolfBallSpawnParameters = {
//     spawnPosition: new Vector3().copy(teeTransform.position),
//     ownerNetworkId: playerNetworkObject.networkId,
//     playerNumber: getGolfPlayerNumber(entityPlayer)
//   }

//   // this spawns the ball on the server
//   dispatch(NetworkWorldAction.spawnObject({prefabType: GolfPrefabTypes.Ball}))
// }

/**
 * @author Mohsen Heydari <github.com/mohsenheydari>
 */

const updateOSIndicator = (ballGroup: BallGroupType): void => {
  if (!ballGroup.visible) {
    return
  }

  const indicator = ballGroup.userData.offscreenIndicator
  const mesh = ballGroup.userData.offscreenIndicatorMesh

  const xr = Engine.renderer.xr
  const camera = xr.enabled && xr.isPresenting ? xr.getCamera(null as any) : Engine.camera

  indicator.camera = camera
  indicator.borderScale = 0.9 + 0.1 * Math.abs(Math.sin(Date.now() / 600))
  indicator.update()

  if (indicator.inside) {
    mesh.visible = false
  } else {
    const pos = indicator.getWorldPos(0.0)
    mesh.position.copy(pos)
    mesh.quaternion.setFromAxisAngle(pos.set(0, 0, 1), indicator.rotation - Math.PI / 2).premultiply(camera.quaternion)
    mesh.visible = true
  }
}

/**
 * @author Mohsen Heydari <github.com/mohsenheydari>
 */
const vec3 = new Vector3()
const playVelocityBasedSFX = (
  entity: Entity,
  index: number,
  minVel: number,
  maxVel: number,
  minVol: number,
  maxVol: number
) => {
  const velocity = getComponent(entity, VelocityComponent)
  const vel = velocity.velocity.length()
  const volume = Math.max(Math.min((vel - minVel) / (maxVel - minVel), maxVol), minVol)
  addComponent(entity, PlaySoundEffect, { index, volume })
}

/**
 * @author Mohsen Heydari <github.com/mohsenheydari>
 */

const wallHitSFX = (entityBall: Entity) => {
  const collisions = getComponent(entityBall, CollisionComponent).collisions as ColliderHitEvent[]

  if (collisions.length > 0 && collisions[0].contacts && collisions[0].contacts.length) {
    const norm = collisions[0].contacts[0].normal
    const dot = norm.y

    // Hitting vertical surface
    if (Math.abs(dot) < 0.1) {
      // TODO: Fine tune the volume
      playVelocityBasedSFX(entityBall, BALL_SFX.HIT_WALL, 1, 3, 0.2, 1)
    }
  }
}

/**
 * @author Josh Field <github.com/HexaField>
 */

export const updateBall = (entityBall: Entity): void => {
  const collider = getComponent(entityBall, ColliderComponent)
  if (!collider) return
  const ballPosition = collider.body.getGlobalPose().translation
  const golfBallComponent = getComponent(entityBall, GolfBallComponent)
  golfBallComponent.groundRaycast.origin.copy(ballPosition as Vector3)

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

    const indicatorPos = ballGroup.userData.indicatorMesh.position.copy(ballGroup.position)
    indicatorPos.y += 0.15 + 0.1 * Math.abs(Math.sin(time / 400))

    // Offscreen indicator
    updateOSIndicator(ballGroup)

    wallHitSFX(entityBall)
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
  const trailHeadGeometry = [] as Array<Vector3>
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

  // Add ball indicator cone
  const coneGeometry = new ConeGeometry(0.1, 0.15)
  const coneMesh = new Mesh(coneGeometry, new MeshPhongMaterial({ color: 'yellow', opacity: 0.75, transparent: true }))
  coneMesh.rotation.x = Math.PI
  Engine.scene.add(coneMesh)
  ballGroup.userData.indicatorMesh = coneMesh

  // Offscreen ball indicator
  const osIndicatorMesh = new Mesh(coneGeometry, new MeshPhongMaterial({ color: 'yellow' }))
  osIndicatorMesh.scale.setScalar(0.07)
  osIndicatorMesh.scale.z *= 0.1
  Engine.scene.add(osIndicatorMesh)
  ballGroup.userData.offscreenIndicatorMesh = osIndicatorMesh
  const osIndicator = new OffScreenIndicator()
  ballGroup.userData.offscreenIndicator = osIndicator
  osIndicator.camera = Engine.camera
  osIndicator.target = ballGroup.position
  osIndicator.margin = 0.05
  osIndicator.setViewportSize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', () => {
    osIndicator.setViewportSize(window.innerWidth, window.innerHeight)
  })
}

type GolfBallSpawnParameters = {
  spawnPosition: Vector3
  playerNumber: number
}

export const initializeGolfBall = (action: typeof GolfAction.spawnBall.matches._TYPE) => {
  // const { spawnPosition, playerNumber } = parameters
  const world = useWorld()
  const ownerEntity = world.getUserAvatarEntity(action.userId)
  const playerNumber = getGolfPlayerNumber(action.userId)
  const ballEntity = world.getNetworkObject(action.networkId)
  console.log('initializeGolfBall', JSON.stringify(action))

  const spawnPosition = getHolePosition()
  const transform = addComponent(ballEntity, TransformComponent, {
    position: new Vector3(spawnPosition.x, spawnPosition.y + golfBallRadius, spawnPosition.z),
    rotation: new Quaternion(),
    scale: new Vector3().setScalar(golfBallRadius)
  })
  addComponent(ballEntity, VelocityComponent, { velocity: new Vector3() })
  addComponent(ballEntity, NameComponent, { name: `GolfBall-${playerNumber}` })

  if (isClient) {
    // addComponent(ballEntity, InterpolationComponent, {})
    const gltf = AssetLoader.getFromCache(Engine.publicPath + '/models/golf/golf_ball.glb')
    assetLoadCallback(gltf.scene, ballEntity, playerNumber)

    addComponent(ballEntity, SoundEffect, {
      src: [
        Engine.publicPath + '/audio/golf/golf_ball_strike.mp3',
        Engine.publicPath + '/audio/golf/golf_ball_drop.wav',
        Engine.publicPath + '/audio/golf/golf_ball_hit_wall.wav'
      ],
      audio: []
    })
  }

  const geometry = new PhysX.PxSphereGeometry(golfBallRadius + golfBallColliderExpansion)

  const shape = world.physics.createShape(geometry, world.physics.physics.createMaterial(0.2, 0.2, 0.9), {
    // we add a rest offset to make the contact detection of the ball bigger, without making the actual size of the ball bigger
    restOffset: -golfBallColliderExpansion,
    // we mostly reverse the expansion for contact detection (so the ball rests on the ground)
    // this will not reverse the expansion for trigger colliders
    contactOffset: -0.005, //golfBallColliderExpansion,
    collisionLayer: GolfCollisionGroups.Ball,
    collisionMask:
      CollisionGroups.Default | CollisionGroups.Ground | GolfCollisionGroups.Course | GolfCollisionGroups.Hole
  })

  const isMyBall = isEntityLocalClient(ownerEntity)

  const body = world.physics.addBody({
    shapes: [shape],
    // make static on server and remote player's balls so we can still detect collision with hole
    type: BodyType.DYNAMIC,
    transform: {
      translation: transform.position,
      rotation: new Quaternion()
    },
    userData: { entity: ballEntity }
  })
  addComponent(ballEntity, ColliderComponent, { body })
  addComponent(ballEntity, CollisionComponent, { collisions: [] })

  const filterDataGround = new PhysX.PxQueryFilterData()
  filterDataGround.setWords(CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Trigger, 0)
  const flags = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
  filterDataGround.setFlags(flags)

  // for track ground
  const groundRaycast: RaycastComponentType = {
    filterData: filterDataGround,
    type: SceneQueryType.Closest,
    hits: [],
    origin: transform.position,
    direction: new Vector3(0, -1, 0),
    maxDistance: 1,
    flags
  }

  const filterDataWall = new PhysX.PxQueryFilterData()
  filterDataWall.setWords(CollisionGroups.Default | CollisionGroups.Ground | GolfCollisionGroups.Course, 0)
  const flags2 = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
  filterDataWall.setFlags(flags2)

  // for track wall
  const wallRaycast: RaycastComponentType = {
    filterData: filterDataWall,
    type: SceneQueryType.Closest,
    hits: [],
    origin: transform.position,
    direction: new Vector3(0, 0, 0),
    maxDistance: 0.5,
    flags: flags2
  }

  addComponent(ballEntity, GolfBallComponent, {
    groundRaycast,
    wallRaycast,
    state: BALL_STATES.INACTIVE,
    number: playerNumber
  })

  return ballEntity
}
