import { OrthographicCamera, PerspectiveCamera } from 'three'

import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { ProjectionType } from '../../camera/types/ProjectionType'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { CameraPropertiesComponentType } from '../components/CameraPropertiesComponent'

export const setCameraProperties = (cameraEntity: Entity, data: CameraPropertiesComponentType): void => {
  const cameraFollow = getComponent(cameraEntity, FollowCameraComponent)

  if (data.projectionType === ProjectionType.Orthographic) {
    Engine.instance.currentWorld.camera = new OrthographicCamera(
      data.fov / -2,
      data.fov / 2,
      data.fov / 2,
      data.fov / -2,
      data.cameraNearClip,
      data.cameraFarClip
    )
  } else if ((Engine.instance.currentWorld.camera as PerspectiveCamera).fov) {
    ;(Engine.instance.currentWorld.camera as PerspectiveCamera).fov = data.fov ?? 50
  }

  Engine.instance.currentWorld.camera.near = data.cameraNearClip
  Engine.instance.currentWorld.camera.far = data.cameraFarClip
  cameraFollow.distance = data.startCameraDistance
  cameraFollow.minDistance = data.minCameraDistance
  cameraFollow.maxDistance = data.maxCameraDistance
  cameraFollow.phi = data.startPhi
  cameraFollow.minPhi = data.minPhi
  cameraFollow.maxPhi = data.maxPhi
  cameraFollow.locked = !data.startInFreeLook
  Engine.instance.currentWorld.camera.updateProjectionMatrix()
  switchCameraMode(cameraEntity, data, true)

  cameraFollow.raycastProps = data.raycastProps
}
