import { ArrowHelper, Clock, Material, MathUtils, Matrix4, Quaternion, SkinnedMesh, Vector3 } from 'three'
import { clamp } from 'three/src/math/MathUtils'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { addActionReceptor, createActionQueue, dispatchAction } from '@xrengine/hyperflux'

import { BoneNames } from '../../avatar/AvatarBoneMatching'
import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { XRCameraUpdatePendingTagComponent } from '../../avatar/components/XRCameraUpdatePendingTagComponent'
import { setAvatarHeadOpacity } from '../../avatar/functions/avatarFunctions'
import { matches } from '../../common/functions/MatchesUtils'
import { smoothDamp } from '../../common/functions/MathLerpFunctions'
import { createConeOfVectors } from '../../common/functions/vectorHelpers'
import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { RAYCAST_PROPERTIES_DEFAULT_VALUES } from '../../scene/functions/loaders/CameraPropertiesFunctions'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraTagComponent } from '../components/CameraTagComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { SpectateComponent } from '../components/SpectateComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'

const direction = new Vector3()
const quaternion = new Quaternion()
const upVector = new Vector3(0, 1, 0)
const empty = new Vector3()
const mx = new Matrix4()
const tempVec = new Vector3()
const tempVec1 = new Vector3()
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

export const getAvatarBonePosition = (entity: Entity, name: BoneNames, position: Vector3): void => {
  const animationComponent = getComponent(entity, AvatarAnimationComponent)
  const el = animationComponent.rig[name].matrixWorld.elements
  position.set(el[12], el[13], el[14])
}

export const updateAvatarOpacity = (entity: Entity) => {
  if (!entity) return

  const fadeDistance = 0.6
  const followCamera = getComponent(entity, FollowCameraComponent)
  const opacity = Math.pow(clamp((followCamera.distance - 0.1) / fadeDistance, 0, 1), 6)

  setAvatarHeadOpacity(entity, opacity)
}

export const updateCameraTargetRotation = (entity: Entity, delta: number) => {
  if (!entity) return
  const followCamera = getComponent(entity, FollowCameraComponent)
  const target = getComponent(entity, TargetCameraRotationComponent)
  const epsilon = 0.001

  target.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, target.phi))

  if (Math.abs(target.phi - followCamera.phi) < epsilon && Math.abs(target.theta - followCamera.theta) < epsilon) {
    removeComponent(entity, TargetCameraRotationComponent)
    return
  }

  followCamera.phi = smoothDamp(followCamera.phi, target.phi, target.phiVelocity, target.time, delta)
  followCamera.theta = smoothDamp(followCamera.theta, target.theta, target.thetaVelocity, target.time, delta)
}

export const getMaxCamDistance = (entity: Entity, target: Vector3) => {
  // Cache the raycast result for 0.1 seconds
  const camComp = getComponent(entity, FollowCameraComponent).raycastProps
  if (camRayCastCache.maxDistance != -1 && camRayCastClock.getElapsedTime() < camComp.rayFrequency) {
    return camRayCastCache
  }

  camRayCastClock.start()

  const sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Scene] || [])

  const followCamera = getComponent(entity, FollowCameraComponent)

  // Raycast to keep the line of sight with avatar
  const cameraTransform = getComponent(Engine.instance.currentWorld.activeCameraEntity, TransformComponent)
  const targetToCamVec = tempVec1.subVectors(cameraTransform.position, target)
  // followCamera.raycaster.ray.origin.sub(targetToCamVec.multiplyScalar(0.1)) // move origin behind camera

  createConeOfVectors(targetToCamVec, cameraRays, rayConeAngle)

  let maxDistance = Math.min(followCamera.maxDistance, camComp.rayLength)

  // Check hit with mid ray
  followCamera.raycaster.set(target, targetToCamVec.normalize())
  const hits = followCamera.raycaster.intersectObjects(sceneObjects, true)

  if (hits[0] && hits[0].distance < maxDistance) {
    maxDistance = hits[0].distance
  }

  //Check the cone for minimum distance
  cameraRays.forEach((rayDir, i) => {
    followCamera.raycaster.set(target, rayDir)
    const hits = followCamera.raycaster.intersectObjects(sceneObjects, true)

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
  const avatarTransform = getComponent(entity, TransformComponent)

  target.set(0, avatar.avatarHeight, 0.2)
  target.applyQuaternion(avatarTransform.rotation)
  target.add(avatarTransform.position)
}

export const updateFollowCamera = (entity: Entity, delta: number) => {
  if (!entity || !Engine.instance.currentWorld.activeCameraEntity) return
  const followCamera = getComponent(entity, FollowCameraComponent)
  const object3DComponent = getComponent(entity, Object3DComponent)
  object3DComponent?.value.updateWorldMatrix(false, true)

  // Limit the pitch
  followCamera.phi = Math.min(followCamera.maxPhi, Math.max(followCamera.minPhi, followCamera.phi))

  calculateCameraTarget(entity, tempVec)

  let maxDistance = followCamera.zoomLevel
  let isInsideWall = false

  // Run only if not in first person mode
  if (followCamera.raycastProps.enabled && followCamera.zoomLevel >= followCamera.minDistance) {
    const distanceResults = getMaxCamDistance(entity, tempVec)
    maxDistance = distanceResults.maxDistance
    isInsideWall = distanceResults.targetHit
  }

  const newZoomDistance = Math.min(followCamera.zoomLevel, maxDistance)

  // if (maxDistance < followCamera.zoomLevel) {
  //   // ground collision
  //   if (followCamera.phi < -15) {
  //     followCamera.distance = maxDistance
  //   }
  // }

  // Zoom smoothing
  let smoothingSpeed = isInsideWall ? 0.1 : 0.3

  followCamera.distance = smoothDamp(
    followCamera.distance,
    newZoomDistance,
    followCamera.zoomVelocity,
    smoothingSpeed,
    delta
  )

  const theta = followCamera.theta
  const thetaRad = MathUtils.degToRad(theta)
  const phiRad = MathUtils.degToRad(followCamera.phi)

  const cameraTransform = getComponent(Engine.instance.currentWorld.activeCameraEntity, TransformComponent)
  cameraTransform.position.set(
    tempVec.x + followCamera.distance * Math.sin(thetaRad) * Math.cos(phiRad),
    tempVec.y + followCamera.distance * Math.sin(phiRad),
    tempVec.z + followCamera.distance * Math.cos(thetaRad) * Math.cos(phiRad)
  )

  direction.copy(cameraTransform.position).sub(tempVec).normalize()

  mx.lookAt(direction, empty, upVector)
  cameraTransform.rotation.setFromRotationMatrix(mx)

  // TODO: Can move avatar update code outside this function
  if (followCamera.locked) {
    const avatarTransform = getComponent(entity, TransformComponent)
    const newTheta = MathUtils.degToRad(theta + 180) % (Math.PI * 2)
    // avatarTransform.rotation.setFromAxisAngle(upVector, newTheta)
    avatarTransform.rotation.slerp(quaternion.setFromAxisAngle(upVector, newTheta), delta * 4)
  }
}

export const initializeCameraComponent = (world: World) => {
  const cameraEntity = createEntity()
  const camObj = Engine.instance.currentWorld.camera
  addComponent(cameraEntity, Object3DComponent, { value: camObj })
  addComponent(cameraEntity, PersistTagComponent, {})
  addComponent(cameraEntity, CameraTagComponent, {})
  addComponent(cameraEntity, TransformComponent, {
    position: camObj.position,
    rotation: camObj.quaternion,
    scale: camObj.scale
  })
  Engine.instance.currentWorld.activeCameraEntity = cameraEntity
  return cameraEntity
}

function registerSpectateMode() {
  addActionReceptor((a) => {
    matches(a).when(EngineActions.spectateUser.matches, (action) => {
      const targetUserCamEntity = Engine.instance.currentWorld.getUserEntityWithComponent(
        action.user as UserId,
        CameraTagComponent
      )

      if (!targetUserCamEntity) return

      console.log('Spectate component added', action.user)
      addComponent(targetUserCamEntity, SpectateComponent, {})
    })
  })
}

function updateSpectator(entity: Entity) {
  const transform = getComponent(entity, TransformComponent)
  const { camera } = Engine.instance.currentWorld
  camera.position.copy(transform.position)
  camera.quaternion.copy(transform.rotation)
}

function enterFollowCameraQuery(entity: Entity) {
  const cameraFollow = getComponent(entity, FollowCameraComponent)
  cameraFollow.raycaster.layers.set(ObjectLayers.Scene) // Ignore avatars
  ;(cameraFollow.raycaster as any).firstHitOnly = true // three-mesh-bvh setting
  cameraFollow.raycaster.far = cameraFollow.maxDistance
  Engine.instance.currentWorld.activeCameraFollowTarget = entity
  //check for initialized raycast properties
  if (!cameraFollow.raycastProps) {
    cameraFollow.raycastProps = RAYCAST_PROPERTIES_DEFAULT_VALUES
  }
  for (let i = 0; i < cameraFollow.raycastProps.rayCount; i++) {
    cameraRays.push(new Vector3())

    if (debugRays) {
      const arrow = new ArrowHelper()
      coneDebugHelpers.push(arrow)
      setObjectLayers(arrow, ObjectLayers.Gizmos)
      Engine.instance.currentWorld.scene.add(arrow)
    }
  }
}

export function cameraSpawnReceptor(
  spawnAction: ReturnType<typeof WorldNetworkAction.spawnCamera>,
  world = Engine.instance.currentWorld
) {
  const entity = world.getNetworkObject(spawnAction.$from, spawnAction.networkId)!

  console.log('Camera Spawn Receptor Call', entity)

  addComponent(entity, PersistTagComponent, {})
  addComponent(entity, CameraTagComponent, {})

  const position = createVector3Proxy(TransformComponent.position, entity)
  const rotation = createQuaternionProxy(TransformComponent.rotation, entity)
  const scale = createVector3Proxy(TransformComponent.scale, entity).setScalar(1)
  addComponent(entity, TransformComponent, { position, rotation, scale })

  if (spawnAction.$from === Engine.instance.userId) {
    const camObj = Engine.instance.currentWorld.camera
    addComponent(entity, Object3DComponent, { value: camObj })
    Engine.instance.currentWorld.activeCameraEntity = entity
  }
}

export default async function CameraSystem(world: World) {
  const cameraTransformUpdateQuery = defineQuery([CameraTagComponent, Object3DComponent, TransformComponent])
  const followCameraQuery = defineQuery([FollowCameraComponent, TransformComponent, AvatarComponent])
  const spectateQuery = defineQuery([CameraTagComponent, SpectateComponent])
  const targetCameraRotationQuery = defineQuery([FollowCameraComponent, TargetCameraRotationComponent])
  const cameraSpawnQueue = createActionQueue(WorldNetworkAction.spawnCamera.matches)
  const localAvatarQuery = defineQuery([AvatarComponent, LocalInputTagComponent])

  registerSpectateMode()

  return () => {
    for (const action of cameraSpawnQueue()) cameraSpawnReceptor(action, world)

    const { deltaSeconds: delta } = world
    for (const entity of localAvatarQuery.enter()) {
      dispatchAction(WorldNetworkAction.spawnCamera(), [world.worldNetwork.hostId])
    }

    for (const entity of followCameraQuery.enter()) {
      enterFollowCameraQuery(entity)
    }

    for (const entity of followCameraQuery.exit()) {
      Engine.instance.currentWorld.activeCameraFollowTarget = null
      camRayCastCache.maxDistance = -1
    }

    for (const entity of cameraTransformUpdateQuery(world)) {
      const transform = getComponent(entity, TransformComponent)
      const cam = getComponent(entity, Object3DComponent).value
      transform.position.copy(cam.position)
      transform.rotation.copy(cam.quaternion)
    }

    for (const entity of spectateQuery(world)) {
      updateSpectator(entity)
    }

    if (getEngineState().sceneLoaded.value) {
      const [followCameraEntity] = followCameraQuery(world)
      if (followCameraEntity !== undefined) {
        updateFollowCamera(followCameraEntity, delta)
        updateAvatarOpacity(followCameraEntity)
      }

      for (const entity of targetCameraRotationQuery(world)) {
        updateCameraTargetRotation(entity, delta)
      }

      if (EngineRenderer.instance.xrManager?.isPresenting) {
        // Current WebXRManager.updateCamera() typedef is incorrect
        ;(EngineRenderer.instance.xrManager as any).updateCamera(Engine.instance.currentWorld.camera)

        removeComponent(Engine.instance.currentWorld.localClientEntity, XRCameraUpdatePendingTagComponent)
      } else if (followCameraEntity !== undefined && Engine.instance.currentWorld.activeCameraEntity) {
        const transform = getComponent(Engine.instance.currentWorld.activeCameraEntity, TransformComponent)
        Engine.instance.currentWorld.camera.position.copy(transform.position)
        Engine.instance.currentWorld.camera.quaternion.copy(transform.rotation)
        Engine.instance.currentWorld.camera.scale.copy(transform.scale)
        Engine.instance.currentWorld.camera.updateMatrixWorld()
      }
    }
  }
}
