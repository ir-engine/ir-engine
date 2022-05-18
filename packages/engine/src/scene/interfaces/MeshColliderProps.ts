import { Quaternion, Vector3 } from 'three'
import { ColliderTypes } from '../../physics/types/PhysicsTypes'

export interface MeshColliderProps {
  position: Vector3
  quaternion: Quaternion
  data: string
  scale: Vector3
  vertices: number[]
  indices: number[]
  type: ColliderTypes
  mass: number
  isTrigger: boolean
  sceneEntityId: string
  collisionLayer: string | number
  collisionMask: string | number
}
