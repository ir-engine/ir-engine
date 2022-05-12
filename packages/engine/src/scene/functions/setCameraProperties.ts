import { OrthographicCamera, PerspectiveCamera } from 'three'

import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { ProjectionType } from '../../camera/types/ProjectionType'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { CameraPropertiesComponentType } from '../components/CameraPropertiesComponent'

export const setCameraProperties = (entity: Entity, data: CameraPropertiesComponentType): void => {
  const cameraFollow = getComponent(entity, FollowCameraComponent)
  console.log('data')

  console.log(data)
  if (data.projectionType === ProjectionType.Orthographic) {
    Engine.instance.camera = new OrthographicCamera(
      data.fov / -2,
      data.fov / 2,
      data.fov / 2,
      data.fov / -2,
      data.cameraNearClip,
      data.cameraFarClip
    )
  } else if ((Engine.instance.camera as PerspectiveCamera).fov) {
    ;(Engine.instance.camera as PerspectiveCamera).fov = data.fov ?? 50
  }

  Engine.instance.camera.near = data.cameraNearClip
  Engine.instance.camera.far = data.cameraFarClip
  cameraFollow.distance = data.startCameraDistance
  cameraFollow.minDistance = data.minCameraDistance
  cameraFollow.maxDistance = data.maxCameraDistance
  cameraFollow.phi = data.startPhi
  cameraFollow.minPhi = data.minPhi
  cameraFollow.maxPhi = data.maxPhi
  cameraFollow.locked = !data.startInFreeLook
  Engine.instance.camera.updateProjectionMatrix()
  switchCameraMode(useWorld().localClientEntity, data, true)

  cameraFollow.raycastProps = data.raycastProps
}
