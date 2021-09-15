const _id = 1 // number
const _positionSize = 3 // Vector3
const _dirSize = 3 // Vector3
const _quaternionSize = 4 // Quaternion
const _velocity = 3 // Vector3
const _angular = 3 // Vector3
const _deltaTime = 1 // number

export const BODY_DATA_SIZE = _id + _positionSize + _quaternionSize + _velocity + _angular
export const KINEMATIC_DATA_SIZE = _id + _positionSize + _quaternionSize
export const CONTROLLER_DATA_SIZE = _id + _positionSize
export const RAYCAST_DATA_SIZE = _id + _positionSize + _dirSize
