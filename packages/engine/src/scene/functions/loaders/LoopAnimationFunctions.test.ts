import assert from 'assert'
import proxyquire from 'proxyquire'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AnimationComponent } from '../../../avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '../../../avatar/components/AvatarAnimationComponent'
import { LoopAnimationComponent, LoopAnimationComponentType } from '../../../avatar/components/LoopAnimationComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { VelocityComponent } from '../../../physics/components/VelocityComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  AnimatedObjectCallbacks,
  SCENE_COMPONENT_LOOP_ANIMATION,
  SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE
} from './LoopAnimationFunctions'

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
}

class AnimationClip {
  static findByName(_a, name) {
    return name
  }
}

describe('LoopAnimationFunctions', () => {
  let entity: Entity
  let direct = true
  let loopAnimationFunctions = proxyquire('./LoopAnimationFunctions', {
    '../../../common/functions/isClient': { isClient: true },
    '../../../ecs/classes/EngineService': {
      accessEngineState: () => {
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

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_LOOP_ANIMATION,
    props: sceneComponentData
  }

  describe('deserializeLoopAnimation()', () => {
    it('will not deserialize component if not on client', () => {
      const _loopAnimationFunctions = proxyquire('./LoopAnimationFunctions', {
        '../../../common/functions/isClient': { isClient: false }
      })

      _loopAnimationFunctions.deserializeLoopAnimation(entity, sceneComponent)

      assert(!hasComponent(entity, LoopAnimationComponent))
    })

    it('will add LoopAnimationComponent with provide data', () => {
      addComponent(entity, Object3DComponent, { value: new Object3D() })
      addComponent(entity, EntityNodeComponent, { components: [] })

      loopAnimationFunctions.deserializeLoopAnimation(entity, sceneComponent)

      const loopAnimation = getComponent(entity, LoopAnimationComponent)
      assert(loopAnimation)
      assert.equal(loopAnimation.activeClipIndex, sceneComponentData.activeClipIndex)
      assert.equal(loopAnimation.hasAvatarAnimations, sceneComponentData.hasAvatarAnimations)

      const animation = getComponent(entity, AnimationComponent)
      assert(animation)

      const entityNode = getComponent(entity, EntityNodeComponent)
      assert(entityNode && entityNode.components.includes(SCENE_COMPONENT_LOOP_ANIMATION))
    })

    it('will call updateLoopAnimation function if scene is loaded', () => {
      addComponent(entity, Object3DComponent, { value: new Object3D() })
      loopAnimationFunctions.deserializeLoopAnimation(entity, sceneComponent)
      assert.equal(direct, true)
    })

    it('will wait for the scene to be loaded and then call updateLoopAnimation function', () => {
      addComponent(entity, Object3DComponent, { value: new Object3D() })
      const _loopAnimationFunctions = proxyquire('./LoopAnimationFunctions', {
        '../../../common/functions/isClient': { isClient: true },
        '../../../networking/functions/matchActionOnce': {
          matchActionOnce: (_a, _b, callback: Function) => {
            direct = false
            callback()
          }
        },
        '../../../ecs/classes/EngineService': {
          accessEngineState: () => {
            return {
              sceneLoaded: {
                value: false
              }
            }
          },
          EngineActions: { sceneLoaded: {} }
        }
      })

      _loopAnimationFunctions.deserializeLoopAnimation(entity, sceneComponent)
      assert.equal(direct, false)
    })
  })

  describe('updateLoopAnimation()', () => {
    let loopAnimation: LoopAnimationComponentType
    let obj3d: Object3D

    beforeEach(() => {
      addComponent(entity, Object3DComponent, { value: new Object3D() })
      loopAnimationFunctions.deserializeLoopAnimation(entity, sceneComponent)
      loopAnimation = getComponent(entity, LoopAnimationComponent) as LoopAnimationComponentType
      obj3d = getComponent(entity, Object3DComponent)?.value as Object3D
      obj3d.animations = [{ name: 'animation 1' }, { name: 'animation 2' }, { name: 'animation 3' }] as any
    })

    it('will not throw any error if Object 3d is not defined', () => {
      assert.doesNotThrow(() => loopAnimationFunctions.updateLoopAnimation(entity))
    })

    describe('Property tests for "hasAvatarAnimations"', () => {
      it('Will add other components if value is true', () => {
        loopAnimation.hasAvatarAnimations = true
        loopAnimationFunctions.updateLoopAnimation(entity)

        const animationComponent = getComponent(entity, AnimationComponent)

        assert(hasComponent(entity, AvatarAnimationComponent))
        assert(hasComponent(entity, VelocityComponent))
        assert.equal(animationComponent.animations, AnimationManager.instance._animations)
      })

      it('Will remove other components if value is false', () => {
        addComponent(entity, AvatarAnimationComponent, {} as any)
        loopAnimation.hasAvatarAnimations = false
        loopAnimationFunctions.updateLoopAnimation(entity)

        const animationComponent = getComponent(entity, AnimationComponent)

        assert(!hasComponent(entity, AvatarAnimationComponent))
        assert(!hasComponent(entity, VelocityComponent))
        assert.equal(animationComponent.animations, obj3d.animations)
      })
    })

    describe('for location only', () => {
      before(() => {
        Engine.instance.isEditor = false
      })

      it('will not throw any error if action is undefined in component or activeClipIndex is less than 0', () => {
        delete loopAnimation.action
        loopAnimation.activeClipIndex = -1
        assert.doesNotThrow(() => loopAnimationFunctions.updateLoopAnimation(entity))
      })

      it('will stop action if it is playing', () => {
        loopAnimation.action = new Action() as any
        ;(loopAnimation.action as any).play()
        loopAnimationFunctions.updateLoopAnimation(entity)

        assert.equal((loopAnimation.action as any).currentState, 'stopped')
      })

      it('will stop action if it is playing', () => {
        loopAnimation.action = new Action() as any
        ;(loopAnimation.action as any).play()
        loopAnimationFunctions.updateLoopAnimation(entity)

        assert.equal((loopAnimation.action as any).currentState, 'stopped')
      })

      it('will play action which has active index', () => {
        loopAnimation.activeClipIndex = 1
        loopAnimationFunctions.updateLoopAnimation(entity)

        assert.equal((loopAnimation.action as any).name, 'animation 2')
        assert.equal((loopAnimation.action as any).currentState, 'playing')
      })
    })
  })

  describe('serializeLoopAnimation()', () => {
    it('should properly serialize loop animation', () => {
      loopAnimationFunctions.deserializeLoopAnimation(entity, sceneComponent)
      assert.deepEqual(loopAnimationFunctions.serializeLoopAnimation(entity), sceneComponent)
    })

    it('should return undefine if there is no loop animation component', () => {
      assert(loopAnimationFunctions.serializeLoopAnimation(entity) === undefined)
    })
  })

  describe('parseLoopAnimationProperties()', () => {
    it('should use default component values', () => {
      const componentData = loopAnimationFunctions.parseLoopAnimationProperties({})
      assert(componentData.activeClipIndex === SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE.activeClipIndex)
      assert(componentData.hasAvatarAnimations === SCENE_COMPONENT_LOOP_ANIMATION_DEFAULT_VALUE.hasAvatarAnimations)
    })

    it('should use passed values', () => {
      const props = {
        hasAvatarAnimations: Math.random(),
        activeClipIndex: Math.random()
      }
      const componentData = loopAnimationFunctions.parseLoopAnimationProperties(props)

      assert(componentData.activeClipIndex === props.activeClipIndex)
      assert(componentData.hasAvatarAnimations === props.hasAvatarAnimations)
    })
  })

  describe('Object 3d animation functions', () => {
    let loopAnimation: LoopAnimationComponentType
    let obj3d: Object3D

    beforeEach(() => {
      addComponent(entity, Object3DComponent, { value: new Object3D() })
      loopAnimationFunctions.deserializeLoopAnimation(entity, sceneComponent)
      loopAnimation = getComponent(entity, LoopAnimationComponent) as LoopAnimationComponentType
      obj3d = getComponent(entity, Object3DComponent)?.value as Object3D
      obj3d.animations = [{ name: 'animation 1' }, { name: 'animation 2' }, { name: 'animation 3' }] as any
      loopAnimation.activeClipIndex = Math.floor(Math.random() * 100) % 3
      loopAnimationFunctions.updateLoopAnimation(entity)
    })

    it('will play active index clip action', () => {
      ;(obj3d as any).play()
      assert.equal(loopAnimation.action?.paused, false)
      assert.equal((loopAnimation.action as any)?.currentState, 'playing')
    })

    it('will pause active index clip action', () => {
      ;(obj3d as any).pause()
      assert.equal(loopAnimation.action?.paused, true)
    })

    it('will stop active index clip action', () => {
      ;(obj3d as any).stop()
      assert.equal((loopAnimation.action as any)?.currentState, 'stopped')
    })

    it('will return AnimatedObjectCallbacks', () => {
      assert.deepEqual((obj3d as any).callbacks(), AnimatedObjectCallbacks)
    })
  })
})
