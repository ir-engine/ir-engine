import { AnimationAction } from 'three'
import { BlendSpace1D } from './BlendSpace1D'
import {
  AvatarStates,
  findDistanceFromDistanceTrack,
  findTimeFromDistanceTrack,
  getMaxDistanceFromDistanceTrack
} from './Util'

/** Class to hold state of an animation for entity */
export class AnimationState {
  /** Name of the animation state */
  name: string
  /** Called when the state is mounted */
  enter = (prevState?: AnimationState) => {}
  /** Called before state dismount */
  exit = () => {}

  update = (delta) => {}
}

// TODO: Complete this
export class EnteryState extends AnimationState {}

export class LocomotionState extends AnimationState {
  blendSpace: BlendSpace1D
  movementParams: any
  idleAction: AnimationAction
  walkAction: AnimationAction
  runAction: AnimationAction
  walkBackwardAction: AnimationAction
  runBackwardAction: AnimationAction
  runWalkTimeRatio: number
  walkVelocity: number
  mixer: any

  walkDistance: number
  runDistance: number

  walkDistanceTrack: any
  runDistanceTrack: any

  constructor() {
    super()
    this.name = AvatarStates.LOCOMOTION
    this.walkDistance = 0
    this.runDistance = 0
  }

  _wrapNumber = (value, max) => value % max

  _updateAnimTime(distanceTrack, speed, distanceTaveled, action) {
    let distance = distanceTaveled
    const maxDist = getMaxDistanceFromDistanceTrack(distanceTrack)
    distance = this._wrapNumber(distance + speed, maxDist)
    action.time = findTimeFromDistanceTrack(distanceTrack, distance)
    return distance
  }

  enter = (prevState?: AnimationState) => {
    this.idleAction.play()
    this.walkAction.play()
    this.runAction.play()
    this.walkBackwardAction.play()
    this.runBackwardAction.play()

    // Enable distance based time seek
    // this.walkAction.timeScale = 0
    // this.runAction.timeScale = 0

    this.runWalkTimeRatio = this.runAction.getClip().duration / this.walkAction.getClip().duration
  }

  updateWalkRun = (delta) => {
    const ratio = this.runAction.weight,
      frameSpeed = delta * (this.movementParams.velocity.z / 1 / 60)

    if (ratio < 0.4) {
      //Run action is the 'follower'
      this.walkDistance = this._updateAnimTime(this.walkDistanceTrack, frameSpeed, this.walkDistance, this.walkAction)
      this.runAction.time = this.walkAction.time * this.runWalkTimeRatio
      this.runDistance = findDistanceFromDistanceTrack(this.runDistanceTrack, this.runAction.time)
    } else {
      //Walk action is the 'follower'
      this.runDistance = this._updateAnimTime(this.runDistanceTrack, frameSpeed, this.runDistance, this.runAction)
      this.walkAction.time = this.runAction.time / this.runWalkTimeRatio
      this.walkDistance = findDistanceFromDistanceTrack(this.walkDistanceTrack, this.walkAction.time)
    }
  }

  update = (delta) => {
    const velocity = this.movementParams.velocity
    const speed = velocity.z / (1 / 60)

    this.blendSpace.value = speed
    this.blendSpace.update()

    if (speed >= this.walkVelocity) {
      this.updateWalkRun(delta)
    } else {
      this.walkDistance = this._updateAnimTime(
        this.walkDistanceTrack,
        speed * delta,
        this.walkDistance,
        this.walkAction
      )
    }
  }
}
