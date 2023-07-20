/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { AnimationClip, AnimationMixer, Vector2, Vector3 } from 'three'

import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectAuthorityTag, NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { AnimationManager } from '../AnimationManager'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarMovementSettingsState } from '../state/AvatarMovementSettingsState'
import { AvatarNetworkAction } from '../state/AvatarNetworkState'
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

  const graph: AnimationGraph = {
    states: {},
    transitionRules: {},
    currentState: null!,
    stateChanged: (name: keyof typeof AvatarStates) => {
      hasComponent(entity, NetworkObjectAuthorityTag) &&
        dispatchAction(
          AvatarNetworkAction.setAnimationState({
            animationState: name,
            entityUUID: getComponent(entity, UUIDComponent)
          })
        )
    }
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

  const avatarMovementSettings = getState(AvatarMovementSettingsState)

  const verticalBlendSpace: BlendSpace1D = {
    minValue: -avatarMovementSettings.runSpeed,
    maxValue: avatarMovementSettings.runSpeed,
    nodes: []
  }

  const horizontalBlendSpace: BlendSpace1D = {
    minValue: -avatarMovementSettings.runSpeed,
    maxValue: avatarMovementSettings.runSpeed,
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
  addBlendSpace1DNode(verticalBlendSpace, walkForwardAction.action, avatarMovementSettings.walkSpeed, walkForwardAction)
  addBlendSpace1DNode(verticalBlendSpace, runForwardAction.action, avatarMovementSettings.runSpeed, runForwardAction)
  // TODO: Set the actual root animation speeds for backward movements
  addBlendSpace1DNode(
    verticalBlendSpace,
    walkBackwardAction.action,
    -avatarMovementSettings.walkSpeed,
    walkBackwardAction
  )
  addBlendSpace1DNode(verticalBlendSpace, runBackwardAction.action, -avatarMovementSettings.runSpeed, runBackwardAction)

  addBlendSpace1DNode(horizontalBlendSpace, locomotionState.idleAction, 0)
  addBlendSpace1DNode(horizontalBlendSpace, runLeftAction.action, -avatarMovementSettings.runSpeed, runLeftAction)
  addBlendSpace1DNode(horizontalBlendSpace, walkLeftAction.action, -avatarMovementSettings.walkSpeed, walkLeftAction)
  addBlendSpace1DNode(horizontalBlendSpace, walkRightAction.action, avatarMovementSettings.walkSpeed, walkRightAction)
  addBlendSpace1DNode(horizontalBlendSpace, runRightAction.action, avatarMovementSettings.runSpeed, runRightAction)

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

  if (hasComponent(entity, NetworkObjectOwnedTag)) {
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
            thresholdTransitionRule(locomotion, 'y', -0.1 / getState(EngineState).simulationTimestep, false)
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

export function changeAvatarAnimationState(entity: Entity, newStateName: string): void {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  changeState(avatarAnimationComponent.animationGraph, newStateName)
}
