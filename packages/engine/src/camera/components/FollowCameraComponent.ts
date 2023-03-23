import { ArrowHelper, Clock, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { getCameraSceneMetadataState } from '../systems/CameraSystem'
import { CameraMode } from '../types/CameraMode'

//const cameraRayCount = 1
export const coneDebugHelpers: ArrowHelper[] = []
// todo properly turn into gizmo
export const debugRays = false

export const FollowCameraComponent = defineComponent({
  name: 'FollowCameraComponent',
  onInit: (entity) => {
    /** @todo add a reactor to dynamically update to these values */
    const cameraSettings = getCameraSceneMetadataState().value

    // if (cameraSettings.projectionType === ProjectionType.Orthographic) {
    //   camera.camera = new OrthographicCamera(
    //     data.fov / -2,
    //     data.fov / 2,
    //     data.fov / 2,
    //     data.fov / -2,
    //     data.cameraNearClip,
    //     data.cameraFarClip
    //   )
    // } else if ((camera.camera as PerspectiveCamera).fov) {
    //   ;(camera.camera as PerspectiveCamera).fov = data.fov ?? 50
    // }

    const cameraRays = [] as Vector3[]
    const rayConeAngle = Math.PI / 6
    const camRayCastClock = new Clock()
    const camRayCastCache = {
      maxDistance: -1,
      targetHit: false
    }

    const raycastProps = {
      enabled: true,
      rayCount: 3,
      rayLength: 15.0,
      rayFrequency: 0.1,
      rayConeAngle,
      camRayCastClock,
      camRayCastCache,
      cameraRays
    }

    for (let i = 0; i < raycastProps.rayCount; i++) {
      cameraRays.push(new Vector3())
      if (debugRays) {
        const arrow = new ArrowHelper()
        arrow.setColor('red')
        coneDebugHelpers.push(arrow)
        setObjectLayers(arrow, ObjectLayers.Gizmos)
        Engine.instance.scene.add(arrow)
      }
    }

    return {
      targetEntity: UndefinedEntity,
      mode: CameraMode.ThirdPerson,
      distance: cameraSettings.startCameraDistance,
      zoomLevel: 5,
      zoomVelocity: { value: 0 },
      minDistance: cameraSettings.minCameraDistance,
      maxDistance: cameraSettings.maxCameraDistance,
      theta: 180,
      phi: cameraSettings.startPhi,
      minPhi: cameraSettings.minPhi,
      maxPhi: cameraSettings.maxPhi,
      shoulderSide: true,
      locked: true,
      raycastProps
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.targetEntity !== 'undefined') component.targetEntity.set(json.targetEntity)
    if (typeof json.mode !== 'undefined') component.mode.set(json.mode)
    if (typeof json.distance !== 'undefined') component.distance.set(json.distance)
    if (typeof json.zoomLevel !== 'undefined') component.zoomLevel.set(json.zoomLevel)
    if (typeof json.zoomVelocity !== 'undefined') component.zoomVelocity.set(json.zoomVelocity)
    if (typeof json.minDistance !== 'undefined') component.minDistance.set(json.minDistance)
    if (typeof json.maxDistance !== 'undefined') component.maxDistance.set(json.maxDistance)
    if (typeof json.theta !== 'undefined') component.theta.set(json.theta)
    if (typeof json.phi !== 'undefined') component.phi.set(json.phi)
    if (typeof json.minPhi !== 'undefined') component.minPhi.set(json.minPhi)
    if (typeof json.maxPhi !== 'undefined') component.maxPhi.set(json.maxPhi)
    if (typeof json.shoulderSide !== 'undefined') component.shoulderSide.set(json.shoulderSide)
    if (typeof json.locked !== 'undefined') component.locked.set(json.locked)
  },

  toJSON: () =>
    null! as {
      targetEntity: Entity
      /** * **Default** value is ```'thirdPerson'```. */
      mode: CameraMode
      /** Distance to the target  */
      distance: number
      /** Desired zoom level  */
      zoomLevel: number
      /** Used internally */
      zoomVelocity: { value: number }
      /** Minimum distance to target */
      minDistance: number
      /** Maximum distance to target */
      maxDistance: number
      /** Rotation around Y axis */
      theta: number
      /** Rotation around Z axis */
      phi: number
      /** Minimum phi value */
      minPhi: number
      /** Maximum phi value */
      maxPhi: number
      /** Whether looking over left or right shoulder */
      shoulderSide: boolean
      /** Whether the camera auto-rotates toward the target **Default** value is true. */
      locked: boolean
    }
})
