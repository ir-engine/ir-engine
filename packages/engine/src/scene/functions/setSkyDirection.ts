import { Vector3 } from 'three'
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem'

export const setSkyDirection = (direction: Vector3) => {
  WebGLRendererSystem.instance.csm?.lightDirection.copy(direction).multiplyScalar(-1)
}
