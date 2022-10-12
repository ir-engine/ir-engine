import { ArrowHelper, Clock, MathUtils, Matrix4, Raycaster, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { deleteSearchParams } from '@xrengine/common/src/utils/deleteSearchParams'
import { createActionQueue, dispatchAction, removeActionQueue } from '@xrengine/hyperflux'

import { BoneNames } from '../../avatar/AvatarBoneMatching'
import { AvatarAnimationComponent, AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { createConeOfVectors } from '../../common/functions/MathFunctions'
import { smoothDamp } from '../../common/functions/MathLerpFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { RAYCAST_PROPERTIES_DEFAULT_VALUES } from '../../scene/components/CameraPropertiesComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { SpectatorComponent } from '../components/SpectatorComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'

const direction = new Vector3()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
const mx = new Matrix4()
const tempVec1 = new Vector3()
const raycaster = new Raycaster()
//const cameraRayCount = 1
const cameraRays: Vector3[] = []
const rayConeAngle = Math.PI / 6
const coneDebugHelpers: ArrowHelper[] = []
const debugRays = false
const camRayCastClock = new Clock()
const camRayCastCache = {
  maxDistance: -1,
  targetHit: false
}

/**
 * Calculates and returns view vector for give angle. View vector will be at the given angle after the calculation
 * @param viewVector Current view vector
 * @param angle angle to which view vector will be rotated
 * @param isDegree Whether the angle is in degree or radian
 * @returns View vector having given angle in the world space
 */
export const rotateViewVectorXZ = (viewVector: Vector3, angle: number, isDegree?: boolean): Vector3 => {
  if (isDegree) {
    angle = (angle * Math.PI) / 180 // Convert to Radian
  }

  const oldAngle = Math.atan2(viewVector.x, viewVector.z)

  // theta - newTheta ==> To rotate Left on mouse drage Right -> Left
  // newTheta - theta ==> To rotate Right on mouse drage Right -> Left
  const dif = oldAngle - angle

  if (Math.abs(dif) % Math.PI > 0.0001) {
    viewVector.setX(Math.sin(oldAngle - dif))
    viewVector.setZ(Math.cos(oldAngle - dif))
  }

  return viewVector
}

export const updateCameraTargetRotation = (cameraEntity: Entity) => {
  if (!cameraEntity) return
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)
  const target = getComponent(cameraEntity, TargetCameraRotationComponent)
  if (!target) return

  const epsilon = 0.001

  target.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, target.phi))

  if (Math.abs(target.phi - followCamera.phi) < epsilon && Math.abs(target.theta - followCamera.theta) < epsilon) {
    removeComponent(followCamera.targetEntity, TargetCameraRotationComponent)
    return
  }

  const delta = Engine.instance.currentWorld.deltaSeconds
  followCamera.phi = smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
  followCamera.theta = smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
}

export const getMaxCamDistance = (cameraEntity: Entity, target: Vector3) => {
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)

  // Cache the raycast result for 0.1 seconds
  const raycastProps = followCamera.raycastProps
  if (camRayCastCache.maxDistance != -1 && camRayCastClock.getElapsedTime() < raycastProps.rayFrequency) {
    return camRayCastCache
  }

  camRayCastClock.start()

  const sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Camera] || [])

  // Raycast to keep the line of sight with avatar
  const cameraTransform = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
  const targetToCamVec = tempVec1.subVectors(cameraTransform.position, target)
  // raycaster.ray.origin.sub(targetToCamVec.multiplyScalar(0.1)) // move origin behind camera

  createConeOfVectors(targetToCamVec, cameraRays, rayConeAngle)

  let maxDistance = Math.min(followCamera.maxDistance, raycastProps.rayLength)

  // Check hit with mid ray
  raycaster.layers.set(ObjectLayers.Camera) // Ignore avatars
  raycaster.firstHitOnly = true // three-mesh-bvh setting
  raycaster.far = followCamera.maxDistance
  raycaster.set(target, targetToCamVec.normalize())
  const hits = raycaster.intersectObjects(sceneObjects, true)

  if (hits[0] && hits[0].distance < maxDistance) {
    maxDistance = hits[0].distance
  }

  //Check the cone for minimum distance
  cameraRays.forEach((rayDir, i) => {
    raycaster.set(target, rayDir)
    const hits = raycaster.intersectObjects(sceneObjects, true)

    if (hits[0] && hits[0].distance < maxDistance) {
      maxDistance = hits[0].distance
    }

    if (debugRays) {
      const helper = coneDebugHelpers[i]
      helper.setDirection(rayDir)
      helper.position.copy(target)

      if (hits[0]) {
        helper.setColor('red')
      } else {
        helper.setColor('green')
      }
    }
  })

  camRayCastCache.maxDistance = maxDistance
  camRayCastCache.targetHit = !!hits[0]

  return camRayCastCache
}

export const calculateCameraTarget = (entity: Entity, target: Vector3) => {
  const avatar = getComponent(entity, AvatarComponent)
  const transform = getComponent(entity, TransformComponent)

  if (!transform) return

  if (avatar) {
    target.set(0, avatar.avatarHeight - 0.1, 0.1)
    target.applyQuaternion(transform.rotation)
    target.add(transform.position)
  } else {
    target.copy(transform.position)
  }
}

const computeCameraFollow = (cameraEntity: Entity, referenceEntity: Entity) => {
  const followCamera = getComponent(cameraEntity, FollowCameraComponent)
  const cameraTransform = getComponent(cameraEntity, TransformComponent)
  const targetTransform = getComponent(referenceEntity, TransformComponent)

  if (!targetTransform) return

  // Limit the pitch
  followCamera.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, followCamera.phi))

  let maxDistance = followCamera.zoomLevel
  let isInsideWall = false

  // Run only if not in first person mode
  if (followCamera.raycastProps.enabled && followCamera.zoomLevel >= followCamera.minDistance) {
    const distanceResults = getMaxCamDistance(cameraEntity, targetTransform.position)
    maxDistance = distanceResults.maxDistance
    isInsideWall = distanceResults.targetHit
  }

  const newZoomDistance = Math.min(followCamera.zoomLevel, maxDistance)

  // Zoom smoothing
  let smoothingSpeed = isInsideWall ? 0.1 : 0.3

  followCamera.distance = smoothDamp(
    followCamera.distance,
    newZoomDistance,
    followCamera.zoomVelocity,
    smoothingSpeed,
    Engine.instance.currentWorld.deltaSeconds
  )

  const theta = followCamera.theta
  const thetaRad = MathUtils.degToRad(theta)
  const phiRad = MathUtils.degToRad(followCamera.phi)

  cameraTransform.position.set(
    targetTransform.position.x + followCamera.distance * Math.sin(thetaRad) * Math.cos(phiRad),
    targetTransform.position.y + followCamera.distance * Math.sin(phiRad),
    targetTransform.position.z + followCamera.distance * Math.cos(thetaRad) * Math.cos(phiRad)
  )

  direction.copy(cameraTransform.position).sub(targetTransform.position).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraTransform.rotation.setFromRotationMatrix(mx)

  updateCameraTargetRotation(cameraEntity)
}

function createCameraRays(entity: Entity) {
  const cameraFollow = getComponent(entity, FollowCameraComponent)
  if (!cameraFollow.raycastProps) {
    cameraFollow.raycastProps = { ...RAYCAST_PROPERTIES_DEFAULT_VALUES }
    for (let i = 0; i < cameraFollow.raycastProps.rayCount; i++) {
      cameraRays.push(new Vector3())
      if (debugRays) {
        const arrow = new ArrowHelper()
        arrow.setColor('red')
        coneDebugHelpers.push(arrow)
        setObjectLayers(arrow, ObjectLayers.Gizmos)
        Engine.instance.currentWorld.scene.add(arrow)
      }
    }
  }
}

export function cameraSpawnReceptor(
  spawnAction: ReturnType<typeof WorldNetworkAction.spawnCamera>,
  world = Engine.instance.currentWorld
) {
  const entity = world.getNetworkObject(spawnAction.$from, spawnAction.networkId)!

  console.log('Camera Spawn Receptor Call', entity)

  addComponent(entity, CameraComponent, null)
}

export default async function CameraSystem(world: World) {
  const followCameraQuery = defineQuery([FollowCameraComponent, TransformComponent])
  const ownedNetworkCamera = defineQuery([CameraComponent, NetworkObjectOwnedTag])
  const spectatorQuery = defineQuery([SpectatorComponent])
  const cameraSpawnActions = createActionQueue(WorldNetworkAction.spawnCamera.matches)
  const spectateUserActions = createActionQueue(EngineActions.spectateUser.matches)

  const execute = () => {
    for (const action of cameraSpawnActions()) cameraSpawnReceptor(action, world)

    for (const action of spectateUserActions()) {
      const cameraEntity = Engine.instance.currentWorld.cameraEntity
      if (action.user) {
        setComponent(cameraEntity, SpectatorComponent, { userId: action.user as UserId })
      } else {
        removeComponent(cameraEntity, SpectatorComponent)
        deleteSearchParams('spectate')
        dispatchAction(EngineActions.leaveWorld({}))
      }
    }

    for (const cameraEntity of followCameraQuery.enter()) {
      const followCamera = getComponent(cameraEntity, FollowCameraComponent)
      setComputedTransformComponent(cameraEntity, followCamera.targetEntity, computeCameraFollow)
      createCameraRays(cameraEntity)
    }

    for (const cameraEntity of followCameraQuery.exit()) {
      removeComponent(cameraEntity, ComputedTransformComponent)
    }

    // as spectator: update local camera from network camera
    for (const cameraEntity of spectatorQuery.enter()) {
      const cameraTransform = getComponent(cameraEntity, TransformComponent)
      const spectator = getComponent(cameraEntity, SpectatorComponent)
      const networkCameraEntity = world.getOwnedNetworkObjectWithComponent(spectator.userId, CameraComponent)
      const networkTransform = getComponent(networkCameraEntity, TransformComponent)
      setComputedTransformComponent(cameraEntity, networkCameraEntity, () => {
        cameraTransform.position.copy(networkTransform.position)
        cameraTransform.rotation.copy(networkTransform.rotation)
      })
    }

    // as spectatee: update network camera from local camera
    for (const networkCameraEntity of ownedNetworkCamera.enter()) {
      const networkTransform = getComponent(networkCameraEntity, TransformComponent)
      const cameraTransform = getComponent(world.cameraEntity, TransformComponent)
      setComputedTransformComponent(networkCameraEntity, world.cameraEntity, () => {
        networkTransform.position.copy(cameraTransform.position)
        networkTransform.rotation.copy(cameraTransform.rotation)
      })
    }
  }

  const cleanup = async () => {
    removeQuery(world, followCameraQuery)
    removeQuery(world, ownedNetworkCamera)
    removeQuery(world, spectatorQuery)
    removeActionQueue(cameraSpawnActions)
    removeActionQueue(spectateUserActions)
  }

  return { execute, cleanup }
}
