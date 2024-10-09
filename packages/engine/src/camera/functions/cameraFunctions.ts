import { Entity, getComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { Frustum, Matrix4, Vector3 } from 'three'

const mat4 = new Matrix4()
const frustum = new Frustum()
const worldPosVec3 = new Vector3()

export const inFrustum = (entity: Entity): boolean => {
  const viewerEntity = getState(EngineState).viewerEntity
  if (!viewerEntity) return false

  const camera = getComponent(viewerEntity, CameraComponent)

  mat4.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  frustum.setFromProjectionMatrix(mat4)

  TransformComponent.getWorldPosition(entity, worldPosVec3)
  return frustum.containsPoint(worldPosVec3)
}
