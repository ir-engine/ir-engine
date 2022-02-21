import { AnimationAction } from 'three'
import { BlendSpace1D } from './BlendSpace1D'
import { DistanceMatchingAction } from './DistanceMatchingAction'
import { AvatarStates } from './Util'

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
  mixer: any

  constructor() {
    super()
    this.name = AvatarStates.LOCOMOTION
  }

  enter = (prevState?: AnimationState) => {
    this.idleAction.play()
    this.walkAction.play()
    this.runAction.play()
    this.walkBackwardAction.play()
    this.runBackwardAction.play()
  }

  updateNodes = (delta, forwardSpeed, nodes) => {
    if (!nodes.length) return
    const frameSpeed = forwardSpeed * delta

    const distanceActionA = nodes[0].data as DistanceMatchingAction,
      distanceActionB = nodes[1].data as DistanceMatchingAction

    if (distanceActionA && distanceActionB) {
      // Both nodes has distance matching actions
      // Sync them as leader/follower
      const ratio = distanceActionB.action.weight
      const timeRatio = distanceActionB.action.getClip().duration / distanceActionA.action.getClip().duration

      if (ratio < 0.5) {
        // Action B is the 'follower'
        distanceActionA.update(frameSpeed)
        distanceActionB.setTime(distanceActionA.action.time * timeRatio)
      } else {
        // Action A is the 'follower'
        distanceActionB.update(frameSpeed)
        distanceActionA.setTime(distanceActionB.action.time / timeRatio)
      }
    } else if (distanceActionA) {
      distanceActionA.update(frameSpeed)
    } else if (distanceActionB) {
      distanceActionB.update(frameSpeed)
    }
  }

  update = (delta) => {
    const velocity = this.movementParams.velocity
    const speed = velocity.z / (1 / 60)

    this.blendSpace.value = speed
    const updatedNodes = this.blendSpace.update()

    this.updateNodes(delta, speed, updatedNodes)
  }
}
