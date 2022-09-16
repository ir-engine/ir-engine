import { NotVoid } from 'lodash'
import { AnimationActionLoopStyles, LoopOnce, LoopRepeat } from 'three'

import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { Engine } from '../../ecs/classes/Engine'
import { createMappedComponent, getComponent } from '../../ecs/functions/ComponentFunctions'

export type AnimationSequencerComponentType = {
  targetObject: any
  animationIndex: number
  loop: boolean
  playOnStart: boolean
  action: SequencerAction
}

export const AnimationSequencerComponent =
  createMappedComponent<AnimationSequencerComponentType>('AnimationSequencerComponent')

export const AnimationSequencerFunctions = ['action.play', 'action.reset']

export class SequencerAction {
  animEnt: ''
  index: ['']
  played: boolean
  isReset: boolean
  shouldLoop: boolean
  constructor(animEnt, index, loop) {
    this.animEnt = animEnt, 
    this.index = index != '' ? index.split(',') : (index = [0])
    this.shouldLoop = loop
    this.played = false
    this.isReset = false
  }

  play() {
    if (this.played) {
      return
    }

    if (this.animEnt == '') {
      return
    }

    const ent = Engine.instance.currentWorld.entityTree.uuidNodeMap.get(this.animEnt)
    if (!ent) {
      return
    }

    const animator = getComponent(ent.entity, AnimationComponent)
    if (!animator) {
      return
    }

    let delay = 0
    let loop = this.shouldLoop

    this.index.forEach(function (i) {
      const clip = animator.mixer.clipAction(animator.animations[Number(i)])
      clip.reset()
      if (loop != undefined && loop == true) {
        clip.setLoop(LoopRepeat, Infinity)
      } else {
        clip.setLoop(LoopOnce, 0)
      }

      clip.play()
      if (delay > 0) {
        clip.startAt(animator.mixer.time + delay)
      }
      delay += clip.getClip().duration
    })
    this.played = true
    this.isReset = false
  }

  reset() {
    if (this.isReset || !this.played) return

    this.played = false
    this.isReset = true
  }
}
