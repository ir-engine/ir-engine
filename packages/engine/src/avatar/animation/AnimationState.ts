import { AnimationAction, LoopOnce, LoopRepeat, Vector2 } from 'three'

import { BlendSpace1D } from './BlendSpace1D'
import { DistanceMatchingAction } from './DistanceMatchingAction'
import { AvatarStates } from './Util'

/** Class to hold state of an animation for entity */
export class AnimationState {
  /** Name of the animation state */
  name: string
  /** Called when the state is mounted */
  enter(prevState?: AnimationState) {
    prevState?.getAnimations().forEach((action) => action.fadeOut(0.1))
  }
  /** Called before state dismount */
  exit() {}

  update(delta) {}

  getAnimations(): AnimationAction[] {
    return []
  }
}

export class LocomotionState extends AnimationState {
  yAxisBlendSpace: BlendSpace1D
  xAxisBlendSpace: BlendSpace1D

  movementParams: any
  forwardMovementActions: DistanceMatchingAction[]
  sideMovementActions: DistanceMatchingAction[]
  idleAction: AnimationAction
  _blendValue: Vector2
  _frameBlendValue: Vector2

  constructor() {
    super()
    this.name = AvatarStates.LOCOMOTION
    this._blendValue = new Vector2()
    this._frameBlendValue = new Vector2()
    this.forwardMovementActions = []
    this.sideMovementActions = []
  }

  getAnimations(): AnimationAction[] {
    const yActions = this.forwardMovementActions.map((node) => node.action)
    const xActions = this.sideMovementActions.map((node) => node.action)
    return [this.idleAction, ...yActions, ...xActions]
  }

  enter(prevState?: AnimationState) {
    super.enter(prevState)
    this.getAnimations().forEach((x) => {
      x.reset().play().fadeIn(0.1)
    })
  }

  /**
   * Syncronizes nodes from two blendspaces
   * @param xNodes Horizontal animation nodes returned by BlendSpace 1D
   * @param yNodes Horizontal animation nodes returned by BlendSpace 1D
   */
  updateNodes(xNodes: any[], yNodes: any[]): void {
    if (!xNodes.length && !yNodes.length) return
    // TODO: Use blend space 2D instead

    let allNodes = [...xNodes, ...yNodes]

    const xIdleNode = xNodes.find((node) => node.action === this.idleAction),
      yIdleNode = yNodes.find((node) => node.action === this.idleAction)

    // If idle action does not exist on both axis
    // Remove it from blending
    if ((xIdleNode && !yIdleNode) || (!xIdleNode && yIdleNode)) {
      allNodes = allNodes.filter((node) => node.action !== this.idleAction)
      this.idleAction.weight = 0
    } else if (xIdleNode && yIdleNode) {
      // If idle exist on both axis
      xIdleNode.weight = yIdleNode.weight = this.idleAction.weight = xIdleNode.weight * yIdleNode.weight
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
      const updateValue = this._frameBlendValue.length()
      leaderAction.update(updateValue)
      distanceActions.forEach((action) => leaderAction.updateFollowerAction(action))
    }
  }

  update(delta) {
    const frameSpeed = 1 / 60
    const velocity = this.movementParams.velocity

    this._blendValue.set(velocity.x, velocity.z).divideScalar(frameSpeed)
    this._frameBlendValue.copy(this._blendValue).multiplyScalar(delta)

    this.xAxisBlendSpace.value = -this._blendValue.x
    const updatedNodesX = this.xAxisBlendSpace.update()

    this.yAxisBlendSpace.value = this._blendValue.y
    const updatedNodesY = this.yAxisBlendSpace.update()

    this.updateNodes(updatedNodesX, updatedNodesY)
  }
}

export class SingleAnimationState extends AnimationState {
  action: AnimationAction
  loop: boolean
  clamp: boolean

  constructor(name: string, loop: boolean, clamp: boolean = false) {
    super()
    this.name = name
    this.loop = loop
    this.clamp = clamp
  }

  getAnimations(): AnimationAction[] {
    return [this.action]
  }

  enter(prevState?: AnimationState) {
    super.enter(prevState)

    if (this.loop) {
      this.action.reset().setLoop(LoopRepeat, Infinity).fadeIn(0.1).play()
    } else {
      this.action.reset().setLoop(LoopOnce, 1).fadeIn(0.1).play()
      this.action.clampWhenFinished = this.clamp
    }
  }
}
