import { Vector3 } from 'three'

export const TransformPivot = {
  Selection: 'Selection' as const,
  Center: 'Center' as const,
  Bottom: 'Bottom' as const
}
export const TransformMode = {
  Disabled: 'Disabled' as const,
  Grab: 'Grab' as const,
  Placement: 'Placement' as const,
  Translate: 'Translate' as const,
  Rotate: 'Rotate' as const,
  Scale: 'Scale' as const
}
export const TransformAxis = {
  X: 'X' as const,
  Y: 'Y' as const,
  Z: 'Z' as const,
  XY: 'XY' as const,
  YZ: 'YZ' as const,
  XZ: 'XZ' as const,
  XYZ: 'XYZ' as const
}
export const TransformAxisConstraints = {
  X: new Vector3(1, 0, 0),
  Y: new Vector3(0, 1, 0),
  Z: new Vector3(0, 0, 1),
  XY: new Vector3(1, 1, 0),
  YZ: new Vector3(0, 1, 1),
  XZ: new Vector3(1, 0, 1),
  XYZ: new Vector3(1, 1, 1)
}

export const SnapMode = {
  Disabled: 'Disabled' as const,
  Grid: 'Grid' as const
}

export enum TransformSpace {
  World,
  Local,
  LocalSelection // The local space of the last selected object
  // TODO: Viewport, Cursor?
}

export type TransformModeType = keyof typeof TransformMode
export type TransformPivotType = keyof typeof TransformPivot
export type TransformAxisType = keyof typeof TransformAxis
export type SnapModeType = keyof typeof SnapMode
