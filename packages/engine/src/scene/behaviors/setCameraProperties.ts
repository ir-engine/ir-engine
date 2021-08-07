import { OrthographicCamera, PerspectiveCamera } from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { ProjectionTypes } from '../../camera/types/ProjectionTypes'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getMutableComponent } from '../../ecs/functions/EntityFunctions'

type SetCameraProps = {
  projectionType?: string
  fov?: number
  cameraNearClip?: number
  cameraFarClip?: number
  minCameraDistance?: number
  maxCameraDistance?: number
  startCameraDistance?: number
}

export const setCameraProperties = (entity: Entity, args: SetCameraProps): void => {
  const cameraFollow = getMutableComponent(entity, FollowCameraComponent)
  if (args.projectionType !== ProjectionTypes.Perspective) {
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
  cameraFollow.minDistance = args.minCameraDistance
  cameraFollow.maxDistance = args.maxCameraDistance
  cameraFollow.distance = args.startCameraDistance
  Engine.camera.updateProjectionMatrix()
}
