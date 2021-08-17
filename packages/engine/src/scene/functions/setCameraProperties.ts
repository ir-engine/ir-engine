import { OrthographicCamera, PerspectiveCamera } from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { ProjectionType } from '../../camera/types/ProjectionType'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { CameraMode } from '@xrengine/engine/src/camera/types/CameraMode'

type SetCameraProps = {
  projectionType?: ProjectionType
  fov?: number
  cameraNearClip?: number
  cameraFarClip?: number
  minCameraDistance?: number
  maxCameraDistance?: number
  startCameraDistance?: number
  cameraMode: CameraMode
  cameraModeDefault: CameraMode
  startInFreeLook: boolean
  minPhi: number
  maxPhi: number
  startPhi: number
}

export const setCameraProperties = (entity: Entity, args: SetCameraProps): void => {
  const cameraFollow = getComponent(entity, FollowCameraComponent)
  if (args.projectionType === ProjectionType.Orthographic) {
    Engine.camera = new OrthographicCamera(
      args.fov / -2,
      args.fov / 2,
      args.fov / 2,
      args.fov / -2,
      args.cameraNearClip,
      args.cameraFarClip
    )
  } else if ((Engine.camera as PerspectiveCamera).fov) {
    ;(Engine.camera as PerspectiveCamera).fov = args.fov
  }

  Engine.camera.near = args.cameraNearClip
  Engine.camera.far = args.cameraFarClip
  cameraFollow.distance = args.startCameraDistance
  cameraFollow.minDistance = args.minCameraDistance
  cameraFollow.maxDistance = args.maxCameraDistance
  cameraFollow.distance = args.startCameraDistance
  cameraFollow.phi = args.startPhi
  cameraFollow.minPhi = args.minPhi
  cameraFollow.maxPhi = args.maxPhi
  cameraFollow.locked = !args.startInFreeLook
  Engine.camera.updateProjectionMatrix()
}
