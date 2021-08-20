export interface BoxColliderProps {
  isTrigger: boolean
  removeMesh: boolean | 'true' | 'false'
  collisionLayer: string | number
  collisionMask: string | number
}
