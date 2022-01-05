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
  p_idx: number
  len: number
  name: string
  local: fungiSerializedTransform
  world: fungiSerializedTransform
}

export type fungiSerializedIKPose = {
  target: {
    start_pos: fungiSerializedVector3
    end_pos: fungiSerializedVector3
    axis: {
      x: fungiSerializedVector3
      y: fungiSerializedVector3
      z: fungiSerializedVector3
    }
    len_sqr: number
    len: number
  }
  hip: {
    bind_height: number
    movement: fungiSerializedVector3
    dir: fungiSerializedVector3
    twist: number
  }
  foot_l: {
    look_dir: fungiSerializedVector3
    twist_dir: fungiSerializedVector3
  }
  foot_r: {
    look_dir: fungiSerializedVector3
    twist_dir: fungiSerializedVector3
  }
  leg_l: {
    len_scale: number
    dir: fungiSerializedVector3
    joint_dir: fungiSerializedVector3
  }
  leg_r: {
    len_scale: number
    dir: fungiSerializedVector3
    joint_dir: fungiSerializedVector3
  }
  arm_l: {
    len_scale: number
    dir: fungiSerializedVector3
    joint_dir: fungiSerializedVector3
  }
  arm_r: {
    len_scale: number
    dir: fungiSerializedVector3
    joint_dir: fungiSerializedVector3
  }
  spine: [
    {
      look_dir: fungiSerializedVector3
      twist_dir: fungiSerializedVector3
    },
    {
      look_dir: fungiSerializedVector3
      twist_dir: fungiSerializedVector3
    }
  ]
  head: {
    look_dir: fungiSerializedVector3
    twist_dir: fungiSerializedVector3
  }
}
