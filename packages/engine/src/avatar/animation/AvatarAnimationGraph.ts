import { AnimationClip, AnimationMixer, Vector2, Vector3 } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { isEntityLocalClient } from '../../networking/functions/isEntityLocalClient'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { AnimationManager } from '../AnimationManager'
import { AvatarSettings } from '../AvatarControllerSystem'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AnimationGraph, changeState } from './AnimationGraph'
import { enterAnimationState } from './AnimationState'
import {
  AnimationTimeTransitionRule,
  BooleanTransitionRule,
  CompositeTransitionRule,
  VectorLengthTransitionRule
} from './AnimationStateTransitionsRule'
import { addBlendSpace1DNode, BlendSpace1D } from './BlendSpace1D'
import { DistanceMatchingAction } from './DistanceMatchingAction'
import { LocomotionState } from './locomotionState'
import { SingleAnimationState } from './singleAnimationState'
import { AvatarAnimations, AvatarStates } from './Util'

const getAnimationAction = (name: string, mixer: AnimationMixer) => {
  const clip = AnimationClip.findByName(AnimationManager.instance._animations, name)
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
  mixer: AnimationMixer,
  velocity: Vector3,
  jumpValue: {} | null
): AnimationGraph {
  if (!mixer) return null!

  const graph: AnimationGraph = {
    states: {},
    transitionRules: {},
    currentState: null!
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
    movementParams: { velocity },
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

  // Transition rules

  const movementTransitionRule: VectorLengthTransitionRule = {
    type: 'VectorLengthTransitionRule',
    value: velocity,
    threshold: 0.001
  }

  graph.transitionRules[AvatarStates.LOCOMOTION] = [
    // Jump
    {
      rule: {
        type: 'BooleanTransitionRule',
        object: jumpValue,
        property: 'isJumping',
        negate: false
      } as BooleanTransitionRule,
      nextState: AvatarStates.JUMP_UP
    },
    // Fall
    {
      rule: {
        type: 'BooleanTransitionRule',
        object: jumpValue,
        property: 'isInAir',
        negate: false
      } as BooleanTransitionRule,
      nextState: AvatarStates.FALL_IDLE
    }
  ]

  graph.transitionRules[AvatarStates.JUMP_UP] = [
    {
      rule: {
        type: 'AnimationTimeTransitionRule',
        action: jumpUpState.action,
        threshold: 0.9
      } as AnimationTimeTransitionRule,
      nextState: AvatarStates.FALL_IDLE
    }
  ]

  graph.transitionRules[AvatarStates.FALL_IDLE] = [
    {
      rule: {
        type: 'BooleanTransitionRule',
        object: jumpValue,
        property: 'isInAir',
        negate: true
      } as BooleanTransitionRule,
      nextState: AvatarStates.JUMP_DOWN
    }
  ]

  graph.transitionRules[AvatarStates.JUMP_DOWN] = [
    {
      rule: {
        type: 'AnimationTimeTransitionRule',
        action: jumpDownState.action,
        threshold: 0.65
      } as AnimationTimeTransitionRule,
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.CLAP] = [
    {
      rule: {
        type: 'CompositeTransitionRule',
        rules: [
          movementTransitionRule,
          {
            type: 'AnimationTimeTransitionRule',
            action: clapState.action,
            threshold: 0.9
          } as AnimationTimeTransitionRule
        ],
        operator: 'or'
      } as CompositeTransitionRule,
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.CRY] = [
    {
      rule: {
        type: 'CompositeTransitionRule',
        rules: [
          movementTransitionRule,
          {
            type: 'AnimationTimeTransitionRule',
            action: cryState.action,
            threshold: 0.9
          } as AnimationTimeTransitionRule
        ],
        operator: 'or'
      } as CompositeTransitionRule,
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.KISS] = [
    {
      rule: {
        type: 'CompositeTransitionRule',
        rules: [
          movementTransitionRule,
          {
            type: 'AnimationTimeTransitionRule',
            action: kissState.action,
            threshold: 0.9
          } as AnimationTimeTransitionRule
        ],
        operator: 'or'
      } as CompositeTransitionRule,
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.WAVE] = [
    {
      rule: {
        type: 'CompositeTransitionRule',
        rules: [
          movementTransitionRule,
          {
            type: 'AnimationTimeTransitionRule',
            action: waveState.action,
            threshold: 0.9
          } as AnimationTimeTransitionRule
        ],
        operator: 'or'
      } as CompositeTransitionRule,
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.LAUGH] = [
    {
      rule: {
        type: 'CompositeTransitionRule',
        rules: [
          movementTransitionRule,
          {
            type: 'AnimationTimeTransitionRule',
            action: laughState.action,
            threshold: 0.9
          } as AnimationTimeTransitionRule
        ],
        operator: 'or'
      } as CompositeTransitionRule,
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.DEFEAT] = [
    {
      rule: {
        type: 'CompositeTransitionRule',
        rules: [
          movementTransitionRule,
          {
            type: 'AnimationTimeTransitionRule',
            action: defeatState.action,
            threshold: 0.9
          } as AnimationTimeTransitionRule
        ],
        operator: 'or'
      } as CompositeTransitionRule,
      nextState: AvatarStates.LOCOMOTION
    }
  ]

  graph.transitionRules[AvatarStates.DANCE1] = [{ rule: movementTransitionRule, nextState: AvatarStates.LOCOMOTION }]
  graph.transitionRules[AvatarStates.DANCE2] = [{ rule: movementTransitionRule, nextState: AvatarStates.LOCOMOTION }]
  graph.transitionRules[AvatarStates.DANCE3] = [{ rule: movementTransitionRule, nextState: AvatarStates.LOCOMOTION }]
  graph.transitionRules[AvatarStates.DANCE4] = [{ rule: movementTransitionRule, nextState: AvatarStates.LOCOMOTION }]

  graph.currentState = locomotionState
  enterAnimationState(graph.currentState)

  return graph
}

export function changeAvatarAnimationState(entity: Entity, newStateName: string): void {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  changeState(avatarAnimationComponent.animationGraph, newStateName)
  if (isEntityLocalClient(entity)) {
    const params = {}
    dispatchAction(Engine.instance.currentWorld.store, NetworkWorldAction.avatarAnimation({ newStateName, params }))
  }
}
