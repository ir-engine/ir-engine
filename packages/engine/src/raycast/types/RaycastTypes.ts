export enum RaycastTypes {
  Camera, // also used for XR
  Physics,
  Custom
}

export interface RaycastHitResults {
  type: RaycastTypes,
  hit: any
}