declare module './PhysX.d.ts' {
  declare global {
    namespace PhysX {
      interface PxShape {
        _id: number
      }
    }
  }
}
