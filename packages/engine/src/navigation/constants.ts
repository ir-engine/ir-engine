import { AvatarSettings } from '../avatar/AvatarControllerSystem'

export const INITIAL_SPEED = AvatarSettings.instance.walkSpeed / 4
export const MIN_SPEED = INITIAL_SPEED
/** Current run speed seems rather Usain Bolt */
export const MAX_SPEED = AvatarSettings.instance.runSpeed / 4
/** Distance from target point that is close enough to stop */
export const THRESHOLD_ARRIVE = 0.2
export const THRESHOLD_ARRIVED_SQUARED = THRESHOLD_ARRIVE * THRESHOLD_ARRIVE
/** Distance from target point that is close enough to start slowing down, as factor of avatar speed */
export const THRESHOLD_ARRIVING_FACTOR = 12
/** Slowing down around turns prevents orbiting behavior */
export const THRESHOLD_TURN_FACTOR = 6
export const ACCELERATION = 0.04
