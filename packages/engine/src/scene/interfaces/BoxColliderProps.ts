import { Quaternion, Vector3 } from 'three'

export interface BoxColliderProps {
  position: Vector3
  quaternion: Quaternion
  scale: Vector3
  isTrigger: boolean
  action: string
  link: string
  collisionLayer: string | number
  collisionMask: string | number
}
