import { AnimationClip, AnimationMixer, Vector3 } from 'three'
import { AnimationManager } from '../AnimationManager'
import { AvatarSettings } from '../AvatarControllerSystem'
import { AnimationGraph } from './AnimationGraph'
import { LocomotionState } from './AnimationState'
import { BlendSpace1D } from './BlendSpace1D'
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

    const locomotionBlendSpace = new BlendSpace1D()
    const locomotionState = new LocomotionState()
    locomotionState.movementParams = { velocity }
    locomotionState.idleAction = getAnimationAction(AvatarAnimations.IDLE, mixer)
    locomotionState.walkAction = getAnimationAction(AvatarAnimations.WALK_FORWARD_ROOT, mixer)
    locomotionState.runAction = getAnimationAction(AvatarAnimations.RUN_FORWARD_ROOT, mixer)
    locomotionState.walkBackwardAction = getAnimationAction(AvatarAnimations.WALK_BACKWARD, mixer)
    locomotionState.runBackwardAction = getAnimationAction(AvatarAnimations.RUN_BACKWARD, mixer)

    locomotionState.blendSpace = locomotionBlendSpace
    locomotionBlendSpace.addNode(locomotionState.runBackwardAction, -AvatarSettings.instance.runSpeed)
    locomotionBlendSpace.addNode(locomotionState.walkBackwardAction, -AvatarSettings.instance.walkSpeed)
    locomotionBlendSpace.addNode(locomotionState.idleAction, 0)
    locomotionBlendSpace.addNode(locomotionState.walkAction, AvatarSettings.instance.walkSpeed)
    locomotionBlendSpace.addNode(locomotionState.runAction, AvatarSettings.instance.runSpeed)
    locomotionBlendSpace.minValue = -AvatarSettings.instance.runSpeed
    locomotionBlendSpace.maxValue = AvatarSettings.instance.runSpeed

    locomotionState.walkDistanceTrack =
      AnimationManager.instance._rootAnimationData[AvatarAnimations.WALK_FORWARD_ROOT].distanceTrack

    locomotionState.runDistanceTrack =
      AnimationManager.instance._rootAnimationData[AvatarAnimations.RUN_FORWARD_ROOT].distanceTrack

    // Add states to the graph
    this.states[AvatarStates.LOCOMOTION] = locomotionState
    // this.states[AvatarStates.JUMP] = jumpState
    // this.states[AvatarStates.LOOPABLE_EMOTE] = loopableEmoteState
    // this.states[AvatarStates.EMOTE] = emoteState

    this.currentState = locomotionState
    locomotionState.enter()
  }
}
