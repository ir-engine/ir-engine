import { Vector3 } from 'three'

export const TransformPivot = {
  Selection: 'Selection',
  Center: 'Center',
  Bottom: 'Bottom'
}
export const TransformMode = {
  Disabled: 'Disabled',
  Grab: 'Grab',
  Placement: 'Placement',
  Translate: 'Translate',
  Rotate: 'Rotate',
  Scale: 'Scale'
}
export const TransformAxis = {
  X: 'X',
  Y: 'Y',
  Z: 'Z',
  XY: 'XY',
  YZ: 'YZ',
  XZ: 'XZ',
  XYZ: 'XYZ'
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
