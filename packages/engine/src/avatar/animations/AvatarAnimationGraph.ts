import { AnimationGraph } from './AnimationGraph'
import { IdleState, LoopableEmoteState, RunState, WalkState, JumpState, EmoteState } from './AnimationState'
import { AvatarStates } from './Util'

/** Class to hold the animation graph for player entity. Every avatar entity will have their saperate graph. */
export class AvatarAnimationGraph extends AnimationGraph {
  constructor() {
    super()

    // Initialize all the states
    const idleState = new IdleState()
    const walkState = new WalkState()
    const runState = new RunState()
    const loopableEmoteState = new LoopableEmoteState()
    const emoteState = new EmoteState()
    const jumpState = new JumpState()

    // Set the next states
    walkState.nextStates.push(IdleState, RunState, JumpState)
    runState.nextStates.push(IdleState, WalkState, JumpState)
    loopableEmoteState.nextStates.push(WalkState, RunState, JumpState, EmoteState)
    jumpState.nextStates.push(IdleState, WalkState, RunState)
    emoteState.nextStates.push(IdleState, WalkState, RunState, JumpState)
    emoteState.autoTransitionTo = AvatarStates.IDLE

    // Add states to the graph
    this.states[AvatarStates.IDLE] = idleState
    this.states[AvatarStates.WALK] = walkState
    this.states[AvatarStates.RUN] = runState
    this.states[AvatarStates.JUMP] = jumpState
    this.states[AvatarStates.LOOPABLE_EMOTE] = loopableEmoteState
    this.states[AvatarStates.EMOTE] = emoteState
    this.defaultState = this.states[AvatarStates.IDLE]
  }
}
