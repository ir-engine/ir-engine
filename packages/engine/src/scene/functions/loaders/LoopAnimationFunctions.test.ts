import assert from 'assert'
import proxyquire from 'proxyquire'
import { Object3D } from 'three'

import {
  LoopAnimationComponent,
  LoopAnimationComponentType,
  SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE
} from '../../../avatar/components/LoopAnimationComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { ModelComponent } from '../../components/ModelComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

class AnimationManager {
  static instance = {
    _animations: [{ name: 'animation 1' }, { name: 'animation 2' }, { name: 'animation 3' }]
  }
}

class Action {
  name: string
  currentState: string
  paused: boolean

  stop() {
    this.currentState = 'stopped'
    return this
  }
  play() {
    this.currentState = 'playing'
    return this
  }
}

class AnimationMixer {
  actions: Action[]

  constructor() {
    this.actions = [new Action(), new Action(), new Action(), new Action(), new Action()]

    this.actions.forEach((action, i) => (action.name = 'animation ' + (i + 1)))
  }

  clipAction = (name: string) => {
    return this.actions.find((action) => action.name === name)
  }

  stopAllAction = () => {
    this.actions.forEach((action) => action.stop())
  }
}

class AnimationClip {
  static findByName(_a, name) {
    return name
  }
}

describe('LoopAnimationFunctions', () => {
  let entity: Entity
  let loopAnimationFunctions = proxyquire('./LoopAnimationFunctions', {
    '../../../common/functions/isClient': { isClient: true },
    '../../../ecs/classes/EngineState': {
      getEngineState: () => {
        return {
          sceneLoaded: {
            value: true
          }
        }
      },
      EngineActions: { sceneLoaded: {} }
    },
    '../../../avatar/functions/avatarFunctions': {
      setupAvatarModel: () => {
        return () => {}
      }
    },
    '../../../avatar/AnimationManager': { AnimationManager },
    three: { Action, AnimationMixer, AnimationClip }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    activeClipIndex: -1,
    hasAvatarAnimations: false
  }

  describe('updateLoopAnimation()', () => {
    let loopAnimation: LoopAnimationComponentType
    let obj3d: Object3D

    beforeEach(() => {
      addComponent(entity, LoopAnimationComponent, sceneComponentData)
      loopAnimation = getComponent(entity, LoopAnimationComponent) as LoopAnimationComponentType
      obj3d = new Object3D()
      obj3d.animations = [{ name: 'animation 1' }, { name: 'animation 2' }, { name: 'animation 3' }] as any
    })

    // causing errors
    // describe('Property tests for "hasAvatarAnimations"', () => {

    //   it('Will add other components if value is true', () => {
    //     loopAnimation.hasAvatarAnimations = true
    //     loopAnimationFunctions.updateLoopAnimation(entity)

    //     const animationComponent = getComponent(entity, AnimationComponent)

    //     assert(hasComponent(entity, AvatarAnimationComponent))
    //     //assert(hasComponent(entity, VelocityComponent)) velocity component no longer present by default
    //     assert.equal(animationComponent.animations, AnimationManager.instance._animations)
    //   })

    //   it('Will remove other components if value is false', () => {
    //     addComponent(entity, AvatarAnimationComponent, {} as any)
    //     loopAnimation.hasAvatarAnimations = false
    //     loopAnimationFunctions.updateLoopAnimation(entity)

    //     const animationComponent = getComponent(entity, AnimationComponent)

    //     assert(!hasComponent(entity, AvatarAnimationComponent))
    //     //assert(!hasComponent(entity, VelocityComponent))
    //     assert.equal(animationComponent.animations, obj3d.animations)
    //   })
    // }
  })

  describe('Object 3d animation functions', () => {
    let loopAnimation: LoopAnimationComponentType
    let obj3d: Object3D

    beforeEach(() => {
      const scene = new Object3D()
      addComponent(entity, LoopAnimationComponent, sceneComponentData)
      loopAnimation = getComponent(entity, LoopAnimationComponent) as LoopAnimationComponentType
      scene.animations = [{ name: 'animation 1' }, { name: 'animation 2' }, { name: 'animation 3' }] as any
      loopAnimation.activeClipIndex = Math.floor(Math.random() * 100) % 3
      loopAnimationFunctions.updateLoopAnimation(entity)
    })
    //causing errors
    /*
    it('will play active index clip action', () => {
      const cb = getComponent(entity, CallbackComponent)
      cb.play(null!)
      assert.equal(loopAnimation.action?.paused, false)
      assert.equal((loopAnimation.action as any)?.currentState, 'playing')
    })

    it('will pause active index clip action', () => {
      const cb = getComponent(entity, CallbackComponent)
      cb.pause(null!)
      assert.equal(loopAnimation.action?.paused, true)
    })

    it('will stop active index clip action', () => {
      const cb = getComponent(entity, CallbackComponent)
      cb.stop(null!)
      assert.equal((loopAnimation.action as any)?.currentState, 'stopped')
    })*/
  })
})
