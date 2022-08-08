import { AnimationClip, AnimationMixer, Vector2, Vector3 } from 'three'

import { dispatchAction, getState } from '@xrengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { AnimationManager } from '../AnimationManager'
import { AvatarSettings } from '../AvatarControllerSystem'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AnimationGraph, changeState } from './AnimationGraph'
import { enterAnimationState } from './AnimationState'
import {
  animationTimeTransitionRule,
  booleanTransitionRule,
  compositeTransitionRule,
  thresholdTransitionRule,
  vectorLengthTransitionRule
} from './AnimationStateTransitionsRule'
import { addBlendSpace1DNode, BlendSpace1D } from './BlendSpace1D'
import { DistanceMatchingAction } from './DistanceMatchingAction'
import { LocomotionState } from './locomotionState'
import { SingleAnimationState } from './singleAnimationState'
import { AvatarAnimations, AvatarStates } from './Util'

export const getAnimationAction = (name: string, mixer: AnimationMixer, animations?: AnimationClip[]) => {
  const clip = AnimationClip.findByName(animations ?? AnimationManager.instance._animations, name)
  return mixer.clipAction(clip)
}

const getDistanceAction = (animationName: string, mixer: AnimationMixer): DistanceMatchingAction => {
  return {
    action: getAnimationAction(animationName, mixer),
    distanceTrack: AnimationManager.instance._rootAnimationData[animationName].distanceTrack,
    distanceTraveled: 0
  } as DistanceMatchingAction
}

export function createAvatarAnimationGraph(
  entity: Entity,
  mixer: AnimationMixer,
  locomotion: Vector3,
  jumpValue: {} | null
): AnimationGraph {
  if (!mixer) return null!

  const isOwnedEntity = hasComponent(entity, NetworkObjectOwnedTag)

  const graph: AnimationGraph = {
    states: {},
    transitionRules: {},
    currentState: null!,
    stateChanged: isOwnedEntity ? dispatchStateChange : null!
  }

  // Initialize all the states
  // Locomotion

  const walkForwardAction = getDistanceAction(AvatarAnimations.WALK_FORWARD_ROOT, mixer),
    runForwardAction = getDistanceAction(AvatarAnimations.RUN_FORWARD_ROOT, mixer),
    walkBackwardAction = getDistanceAction(AvatarAnimations.WALK_BACKWARD_ROOT, mixer),
    runBackwardAction = getDistanceAction(AvatarAnimations.RUN_BACKWARD_ROOT, mixer),
    walkLeftAction = getDistanceAction(AvatarAnimations.WALK_STRAFE_LEFT_ROOT, mixer),
    runLeftAction = getDistanceAction(AvatarAnimations.RUN_STRAFE_LEFT_ROOT, mixer),
    walkRightAction = getDistanceAction(AvatarAnimations.WALK_STRAFE_RIGHT_ROOT, mixer),
    runRightAction = getDistanceAction(AvatarAnimations.RUN_STRAFE_RIGHT_ROOT, mixer)

  const verticalBlendSpace: BlendSpace1D = {
    minValue: -AvatarSettings.instance.runSpeed,
    maxValue: AvatarSettings.instance.runSpeed,
    nodes: []
  }

  const horizontalBlendSpace: BlendSpace1D = {
    minValue: -AvatarSettings.instance.runSpeed,
    maxValue: AvatarSettings.instance.runSpeed,
    nodes: []
  }

  const locomotionState: LocomotionState = {
    name: AvatarStates.LOCOMOTION,
    type: 'LocomotionState',
    yAxisBlendSpace: verticalBlendSpace,
    xAxisBlendSpace: horizontalBlendSpace,
    locomotion,
    forwardMovementActions: [walkForwardAction, runForwardAction, walkBackwardAction, runBackwardAction],
    sideMovementActions: [walkLeftAction, runLeftAction, walkRightAction, runRightAction],
    idleAction: getAnimationAction(AvatarAnimations.IDLE, mixer),
    blendValue: new Vector2(),
    frameBlendValue: new Vector2()
  }

  addBlendSpace1DNode(verticalBlendSpace, locomotionState.idleAction, 0)
  addBlendSpace1DNode(
    verticalBlendSpace,
    walkForwardAction.action,
    AvatarSettings.instance.walkSpeed,
    walkForwardAction
  )
  addBlendSpace1DNode(verticalBlendSpace, runForwardAction.action, AvatarSettings.instance.runSpeed, runForwardAction)
  // TODO: Set the actual root animation speeds for backward movements
  addBlendSpace1DNode(
    verticalBlendSpace,
    walkBackwardAction.action,
    -AvatarSettings.instance.walkSpeed,
    walkBackwardAction
  )
  addBlendSpace1DNode(
    verticalBlendSpace,
    runBackwardAction.action,
    -AvatarSettings.instance.runSpeed,
    runBackwardAction
  )

  addBlendSpace1DNode(horizontalBlendSpace, locomotionState.idleAction, 0)
  addBlendSpace1DNode(horizontalBlendSpace, runLeftAction.action, -AvatarSettings.instance.runSpeed, runLeftAction)
  addBlendSpace1DNode(horizontalBlendSpace, walkLeftAction.action, -AvatarSettings.instance.walkSpeed, walkLeftAction)
  addBlendSpace1DNode(horizontalBlendSpace, walkRightAction.action, AvatarSettings.instance.walkSpeed, walkRightAction)
  addBlendSpace1DNode(horizontalBlendSpace, runRightAction.action, AvatarSettings.instance.runSpeed, runRightAction)

  // Jump

  const jumpUpState: SingleAnimationState = {
    name: AvatarStates.JUMP_UP,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.JUMP_UP, mixer),
    loop: false,
    clamp: true
  }

  const jumpDownState: SingleAnimationState = {
    name: AvatarStates.JUMP_DOWN,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.JUMP_DOWN, mixer),
    loop: false,
    clamp: true
  }

  const fallState: SingleAnimationState = {
    name: AvatarStates.FALL_IDLE,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.FALL_IDLE, mixer),
    loop: true,
    clamp: false
  }

  // Emotes

  const clapState: SingleAnimationState = {
    name: AvatarStates.CLAP,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.CLAP, mixer),
    loop: false,
    clamp: true
  }

  const cryState: SingleAnimationState = {
    name: AvatarStates.CRY,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.CRY, mixer),
    loop: false,
    clamp: true
  }

  const kissState: SingleAnimationState = {
    name: AvatarStates.KISS,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.KISS, mixer),
    loop: false,
    clamp: true
  }

  const waveState: SingleAnimationState = {
    name: AvatarStates.WAVE,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.WAVE, mixer),
    loop: false,
    clamp: true
  }

  const laughState: SingleAnimationState = {
    name: AvatarStates.LAUGH,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.LAUGH, mixer),
    loop: false,
    clamp: true
  }

  const defeatState: SingleAnimationState = {
    name: AvatarStates.DEFEAT,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.DEFEAT, mixer),
    loop: false,
    clamp: true
  }

  const dance1State: SingleAnimationState = {
    name: AvatarStates.DANCE1,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.DANCING_1, mixer),
    loop: true,
    clamp: false
  }

  const dance2State: SingleAnimationState = {
    name: AvatarStates.DANCE2,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.DANCING_2, mixer),
    loop: true,
    clamp: false
  }

  const dance3State: SingleAnimationState = {
    name: AvatarStates.DANCE3,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.DANCING_3, mixer),
    loop: true,
    clamp: false
  }

  const dance4State: SingleAnimationState = {
    name: AvatarStates.DANCE4,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.DANCING_4, mixer),
    loop: true,
    clamp: false
  }

  // Mount Point

  const sitEnterState: SingleAnimationState = {
    name: AvatarStates.SIT_ENTER,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.IDLE, mixer),
    loop: false,
    clamp: true
  }

  const sitLeaveState: SingleAnimationState = {
    name: AvatarStates.SIT_LEAVE,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.IDLE, mixer),
    loop: false,
    clamp: true
  }

  const sitIdleState: SingleAnimationState = {
    name: AvatarStates.SIT_IDLE,
    type: 'SingleAnimationState',
    action: getAnimationAction(AvatarAnimations.IDLE, mixer),
    loop: true,
    clamp: false
  }

  // Add states to the graph
  graph.states[AvatarStates.LOCOMOTION] = locomotionState
  graph.states[AvatarStates.JUMP_UP] = jumpUpState
  graph.states[AvatarStates.FALL_IDLE] = fallState
  graph.states[AvatarStates.JUMP_DOWN] = jumpDownState
  graph.states[AvatarStates.CLAP] = clapState
  graph.states[AvatarStates.CRY] = cryState
  graph.states[AvatarStates.KISS] = kissState
  graph.states[AvatarStates.WAVE] = waveState
  graph.states[AvatarStates.LAUGH] = laughState
  graph.states[AvatarStates.DEFEAT] = defeatState
  graph.states[AvatarStates.DANCE1] = dance1State
  graph.states[AvatarStates.DANCE2] = dance2State
  graph.states[AvatarStates.DANCE3] = dance3State
  graph.states[AvatarStates.DANCE4] = dance4State
  graph.states[AvatarStates.SIT_ENTER] = sitEnterState
  graph.states[AvatarStates.SIT_LEAVE] = sitLeaveState
  graph.states[AvatarStates.SIT_IDLE] = sitIdleState

  // Transition rules

  const movementTransitionRule = vectorLengthTransitionRule(locomotion, 0.001)

  if (isOwnedEntity) {
    graph.transitionRules[AvatarStates.LOCOMOTION] = [
      // Jump
      {
        rule: booleanTransitionRule(jumpValue, 'isJumping'),
        nextState: AvatarStates.JUMP_UP
      },
      // Fall - threshold rule is to prevent fall_idle when going down ramps or over gaps
      {
        rule: compositeTransitionRule(
          [
            booleanTransitionRule(jumpValue, 'isInAir'),
            thresholdTransitionRule(locomotion, 'y', -0.1 / getState(EngineState).fixedDeltaSeconds.value, false)
          ],
          'and'
        ),
        nextState: AvatarStates.FALL_IDLE
      }
    ]

    graph.transitionRules[AvatarStates.JUMP_UP] = [
      {
        rule: animationTimeTransitionRule(jumpUpState.action, 0.9),
        nextState: AvatarStates.FALL_IDLE
      }
    ]

    graph.transitionRules[AvatarStates.FALL_IDLE] = [
      {
        rule: booleanTransitionRule(jumpValue, 'isInAir', true),
        nextState: AvatarStates.JUMP_DOWN
      }
    ]

    graph.transitionRules[AvatarStates.JUMP_DOWN] = [
      {
        rule: animationTimeTransitionRule(jumpDownState.action, 0.65),
        nextState: AvatarStates.LOCOMOTION
      }
    ]
  }

  graph.transitionRules[AvatarStates.CLAP] = [
    {
      rule: compositeTransitionRule([movementTransitionRule, animationTimeTransitionRule(clapState.action, 0.9)], 'or'),
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.CRY] = [
    {
      rule: compositeTransitionRule([movementTransitionRule, animationTimeTransitionRule(cryState.action, 0.9)], 'or'),
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.KISS] = [
    {
      rule: compositeTransitionRule([movementTransitionRule, animationTimeTransitionRule(kissState.action, 0.9)], 'or'),
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.WAVE] = [
    {
      rule: compositeTransitionRule([movementTransitionRule, animationTimeTransitionRule(waveState.action, 0.9)], 'or'),
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.LAUGH] = [
    {
      rule: compositeTransitionRule(
        [movementTransitionRule, animationTimeTransitionRule(laughState.action, 0.9)],
        'or'
      ),
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.DEFEAT] = [
    {
      rule: compositeTransitionRule(
        [movementTransitionRule, animationTimeTransitionRule(defeatState.action, 0.9)],
        'or'
      ),
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.DANCE1] = [{ rule: movementTransitionRule, nextState: AvatarStates.LOCOMOTION }]
  graph.transitionRules[AvatarStates.DANCE2] = [{ rule: movementTransitionRule, nextState: AvatarStates.LOCOMOTION }]
  graph.transitionRules[AvatarStates.DANCE3] = [{ rule: movementTransitionRule, nextState: AvatarStates.LOCOMOTION }]
  graph.transitionRules[AvatarStates.DANCE4] = [{ rule: movementTransitionRule, nextState: AvatarStates.LOCOMOTION }]

  graph.transitionRules[AvatarStates.SIT_ENTER] = [
    {
      rule: animationTimeTransitionRule(sitEnterState.action, 0.95),
      nextState: AvatarStates.SIT_IDLE
    }
  ]

  graph.currentState = locomotionState
  enterAnimationState(graph.currentState)

  return graph
}

function dispatchStateChange(name: string, graph: AnimationGraph): void {
  const params = {}
  dispatchAction(WorldNetworkAction.avatarAnimation({ newStateName: name, params }))
}

export function changeAvatarAnimationState(entity: Entity, newStateName: string): void {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  changeState(avatarAnimationComponent.animationGraph, newStateName)
}
