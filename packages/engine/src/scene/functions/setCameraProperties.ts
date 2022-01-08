import { OrthographicCamera, PerspectiveCamera } from 'three'

import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { CameraMode } from '../../camera/types/CameraMode'
import { ProjectionType } from '../../camera/types/ProjectionType'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'

type Props = {
  projectionType: ProjectionType
  fov: number
  cameraNearClip: number
  cameraFarClip: number
  minCameraDistance: number
  maxCameraDistance: number
  startCameraDistance: number
  cameraMode: CameraMode
  cameraModeDefault: CameraMode
  startInFreeLook: boolean
  minPhi: number
  maxPhi: number
  startPhi: number
}

export const setCameraProperties = (entity: Entity, data: Props): void => {
  const cameraFollow = getComponent(entity, FollowCameraComponent)
  console.log('data')

  console.log(data)
  if (data.projectionType === ProjectionType.Orthographic) {
    Engine.camera = new OrthographicCamera(
      data.fov / -2,
      data.fov / 2,
      data.fov / 2,
      data.fov / -2,
      data.cameraNearClip,
      data.cameraFarClip
    )
  } else if ((Engine.camera as PerspectiveCamera).fov) {
    ;(Engine.camera as PerspectiveCamera).fov = data.fov ?? 50
  }

  Engine.camera.near = data.cameraNearClip
  Engine.camera.far = data.cameraFarClip
  cameraFollow.distance = data.startCameraDistance
  cameraFollow.minDistance = data.minCameraDistance
  cameraFollow.maxDistance = data.maxCameraDistance
  cameraFollow.phi = data.startPhi
  cameraFollow.minPhi = data.minPhi
  cameraFollow.maxPhi = data.maxPhi
  cameraFollow.locked = !data.startInFreeLook
  Engine.camera.updateProjectionMatrix()
  switchCameraMode(useWorld().localClientEntity, data, true)
}
