import { AnimationClip, AnimationMixer, Vector3 } from 'three'
import { AnimationManager } from '../AnimationManager'
import { AvatarSettings } from '../AvatarControllerSystem'
import { AnimationGraph } from './AnimationGraph'
import { LocomotionState } from './AnimationState'
import { BlendSpace1D } from './BlendSpace1D'
import { DistanceMatchingAction } from './DistanceMatchingAction'
import { AvatarStates, AvatarAnimations } from './Util'

const getAnimationAction = (name: string, mixer: AnimationMixer) => {
  const clip = AnimationClip.findByName(AnimationManager.instance._animations, name)
  return mixer.clipAction(clip)
}

/** Class to hold the animation graph for player entity. Every avatar entity will have their saperate graph. */
export class AvatarAnimationGraph extends AnimationGraph {
  initialize(mixer: AnimationMixer, velocity: Vector3) {
    if (!mixer) return

    // Initialize all the states

    const walkForwardAction = new DistanceMatchingAction(
      getAnimationAction(AvatarAnimations.WALK_FORWARD_ROOT, mixer),
      AnimationManager.instance._rootAnimationData[AvatarAnimations.WALK_FORWARD_ROOT].distanceTrack
    )

    const runForwardAction = new DistanceMatchingAction(
      getAnimationAction(AvatarAnimations.RUN_FORWARD_ROOT, mixer),
      AnimationManager.instance._rootAnimationData[AvatarAnimations.RUN_FORWARD_ROOT].distanceTrack
    )

    const locomotionBlendSpace = new BlendSpace1D()
    const locomotionState = new LocomotionState()
    locomotionState.movementParams = { velocity }
    locomotionState.idleAction = getAnimationAction(AvatarAnimations.IDLE, mixer)
    locomotionState.walkAction = walkForwardAction.action
    locomotionState.runAction = runForwardAction.action
    locomotionState.walkBackwardAction = getAnimationAction(AvatarAnimations.WALK_BACKWARD, mixer)
    locomotionState.runBackwardAction = getAnimationAction(AvatarAnimations.RUN_BACKWARD, mixer)

    locomotionState.blendSpace = locomotionBlendSpace
    locomotionBlendSpace.addNode(locomotionState.runBackwardAction, -AvatarSettings.instance.runSpeed)
    locomotionBlendSpace.addNode(locomotionState.walkBackwardAction, -AvatarSettings.instance.walkSpeed)
    locomotionBlendSpace.addNode(locomotionState.idleAction, 0)
    locomotionBlendSpace.addNode(walkForwardAction.action, AvatarSettings.instance.walkSpeed, walkForwardAction)
    locomotionBlendSpace.addNode(runForwardAction.action, AvatarSettings.instance.runSpeed, runForwardAction)
    locomotionBlendSpace.minValue = -AvatarSettings.instance.runSpeed
    locomotionBlendSpace.maxValue = AvatarSettings.instance.runSpeed

    // Add states to the graph
    this.states[AvatarStates.LOCOMOTION] = locomotionState
    // this.states[AvatarStates.JUMP] = jumpState
    // this.states[AvatarStates.LOOPABLE_EMOTE] = loopableEmoteState
    // this.states[AvatarStates.EMOTE] = emoteState

    this.currentState = locomotionState
    locomotionState.enter()
  }
}
