export interface BoxColliderProps {
  isTrigger: boolean
  removeMesh: boolean | 'true' | 'false'
  collisionLayer: number
  collisionMask: number
}
