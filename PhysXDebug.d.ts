declare module './PhysX.d.ts' {
  declare global {
    namespace PhysX {
      interface PxShape {
        _id: number
        _type?: ColliderTypes
        _bodyType?: BodyType
        _isTrigger?: boolean
        _staticFriction?: number
        _dynamicFriction?: number
        _restitution?: number
        _vertices?: number[]
        _indices?: number[]
        _collisionLayer?: number | string
        _collisionMask?: number | string
        _contactOffset?: number | string
        _restOffset?: number | string
        _scale?: { x: number; y: number; z: number }
        _debugNeedsUpdate?: boolean
      }
      interface PxRigidActor {
        _shapes: PhysX.PxShape[]
        _type: any
        _debugNeedsUpdate: boolean
      }
    }
  }
}
