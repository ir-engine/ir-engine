export type fungiSerializedVector3 = {
  '0': number
  '1': number
  '2': number
}
export type fungiSerializedQuaternion = {
  '0': number
  '1': number
  '2': number
  '3': number
}

export type fungiSerializedTransform = {
  rot: fungiSerializedQuaternion
  pos: fungiSerializedVector3
  scl: fungiSerializedVector3
}
export type fungiSerializedPoseBones = {
  chg_state: number
  idx: number
  p_idx: number | null
  len: number
  name: string
  local: fungiSerializedTransform
  world: fungiSerializedTransform
}
