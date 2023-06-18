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

import { AnimationAction, Vector2, Vector3 } from 'three'

import { AnimationState, fadeOutAnimationStateActions } from './AnimationState'
import { BlendSpace1D, updateBlendSpace1D } from './BlendSpace1D'
import { DistanceMatchingAction, updateDistanceMatchingAction, updateFollowerAction } from './DistanceMatchingAction'

export type LocomotionState = AnimationState & {
  type: 'LocomotionState'
  yAxisBlendSpace: BlendSpace1D
  xAxisBlendSpace: BlendSpace1D
  locomotion: Vector3
  forwardMovementActions: DistanceMatchingAction[]
  sideMovementActions: DistanceMatchingAction[]
  idleAction: AnimationAction
  blendValue: Vector2
  frameBlendValue: Vector2
}

function updateNodes(state: LocomotionState, xNodes: any[], yNodes: any[]): void {
  if (!xNodes.length && !yNodes.length) return
  // TODO: Use blend space 2D instead

  let allNodes = [...xNodes, ...yNodes]

  const xIdleNode = xNodes.find((node) => node.action === state.idleAction),
    yIdleNode = yNodes.find((node) => node.action === state.idleAction)

  // If idle action does not exist on both axis
  // Remove it from blending
  if ((xIdleNode && !yIdleNode) || (!xIdleNode && yIdleNode)) {
    allNodes = allNodes.filter((node) => node.action !== state.idleAction)
    state.idleAction.weight = 0
  } else if (xIdleNode && yIdleNode) {
    // If idle exist on both axis
    xIdleNode.weight = yIdleNode.weight = state.idleAction.weight = xIdleNode.weight * yIdleNode.weight
  }

  // Remove duplicate nodes
  for (let index1 = 0; index1 < allNodes.length; index1++) {
    const firstNode = allNodes[index1]

    for (let index2 = index1 + 1; index2 < allNodes.length; index2++) {
      const secondNode = allNodes[index2]
      if (firstNode.action === secondNode.action) {
        firstNode.weight += secondNode.weight
        allNodes.splice(index2, 1)
        index2--
      }
    }
  }

  // Normalize and assign weights
  const totalWeight = allNodes.reduce((total, node) => total + node.weight, 0)

  allNodes.forEach((node) => {
    node.weight = node.action.weight = node.weight / totalWeight
  })

  // Update distance based actions

  const distanceActions = allNodes
    .filter((node) => node.data)
    .map((node) => node.data as DistanceMatchingAction)
    .sort((a, b) => b.action.weight - a.action.weight)

  const leaderAction = distanceActions.shift()
  if (leaderAction) {
    const updateValue = state.frameBlendValue.length()
    updateDistanceMatchingAction(leaderAction, updateValue)
    distanceActions.forEach((action) => updateFollowerAction(leaderAction, action))
  }
}

export function updateLocomotionStateBlendValues(state: LocomotionState, delta: number) {
  const locomotion = state.locomotion
  state.blendValue.set(locomotion.x, locomotion.z)
  state.frameBlendValue.copy(state.blendValue).multiplyScalar(delta)
}

export function updateLocomotionState(state: LocomotionState, delta: number) {
  updateLocomotionStateBlendValues(state, delta)

  const updatedNodesX = updateBlendSpace1D(state.xAxisBlendSpace, -state.blendValue.x)
  const updatedNodesY = updateBlendSpace1D(state.yAxisBlendSpace, state.blendValue.y)

  updateNodes(state, updatedNodesX, updatedNodesY)
}

export function enterLocomotionState(state: LocomotionState, prevState?: LocomotionState) {
  fadeOutAnimationStateActions(prevState)
  getLocomotionStateActions(state).forEach((x) => {
    x.reset().play().fadeIn(0.1)
  })
}

export function getLocomotionStateActions(state: LocomotionState): AnimationAction[] {
  const yActions = state.forwardMovementActions.map((node) => node.action)
  const xActions = state.sideMovementActions.map((node) => node.action)
  return [state.idleAction, ...yActions, ...xActions]
}
