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

import { useEffect } from 'react'
import { AnimationAction, AnimationClip, AnimationMixer } from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import {
  ComponentType,
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { CallbackComponent, StandardCallbacks, setCallback } from '../../scene/components/CallbackComponent'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { AnimationComponent } from './AnimationComponent'

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  jsonID: 'loop-animation',

  onInit: (entity) => {
    return {
      activeClipIndex: -1,
      isVRM: false,
      animationPack: '',
      action: null as AnimationAction | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.activeClipIndex === 'number') component.activeClipIndex.set(json.activeClipIndex)
    if (typeof json.animationPack === 'string') component.animationPack.set(json.animationPack)
    if (typeof json.isVRM === 'boolean') component.isVRM.set(json.isVRM)
  },

  toJSON: (entity, component) => {
    return {
      activeClipIndex: component.activeClipIndex.value,
      animationPack: component.animationPack.value,
      hasAvatarAnimations: component.isVRM.value
    }
  },

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()

    const modelComponent = useOptionalComponent(entity, ModelComponent)

    const animComponent = useOptionalComponent(entity, AnimationComponent)

    const loopAnimationComponent = useOptionalComponent(entity, LoopAnimationComponent)
    /**
     * Callback functions
     */
    useEffect(() => {
      if (hasComponent(entity, CallbackComponent)) return
      const play = () => {
        playAnimationClip(getComponent(entity, AnimationComponent), getComponent(entity, LoopAnimationComponent))
      }
      const pause = () => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        if (loopAnimationComponent.action) loopAnimationComponent.action.paused = true
      }
      const stop = () => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        if (loopAnimationComponent.action) loopAnimationComponent.action.stop()
      }
      setCallback(entity, StandardCallbacks.PLAY, play)
      setCallback(entity, StandardCallbacks.PAUSE, pause)
      setCallback(entity, StandardCallbacks.STOP, stop)
    }, [])

    useEffect(() => {
      if (loopAnimationComponent && modelComponent?.scene.value)
        loopAnimationComponent.isVRM.set(modelComponent.scene.value.userData?.type === 'vrm')
    }, [modelComponent?.scene])

    /**
     * A model is required for LoopAnimationComponent.
     */
    useEffect(() => {
      if (!modelComponent?.scene?.value) return

      const scene = modelComponent.scene.value

      if (!hasComponent(entity, AnimationComponent)) {
        setComponent(entity, AnimationComponent, {
          mixer: new AnimationMixer(scene),
          animationSpeed: 1,
          animations: []
        })
      }
    }, [modelComponent?.scene])

    useEffect(() => {
      if (!modelComponent?.scene?.value) return

      const scene = modelComponent.scene.value

      const loopComponent = getComponent(entity, LoopAnimationComponent)
      const animationComponent = getComponent(entity, AnimationComponent)

      if (!loopAnimationComponent || !loopAnimationComponent.animationPack.value) return
      AssetLoader.loadAsync(loopAnimationComponent?.animationPack.value).then((model) => {
        const animations = model.animations
        animationComponent.animations = animations
      })

      //      const changedToAvatarAnimation =
      //        loopComponent.hasAvatarAnimations && animationComponent.animations !== AnimationManager.instance._animations

      /*      if (changedToAvatarAnimation) {
        if (!hasComponent(entity, AvatarAnimationComponent)) {
          setComponent(entity, AvatarAnimationComponent, {
            animationGraph: {
              states: {},
              transitionRules: {},
              currentState: null!,
              stateChanged: null!
            },
            rootYRatio: 1,
            locomotion: new Vector3()
          })
          const setupLoopableAvatarModel = setupAvatarModel(entity)
          setupLoopableAvatarModel(scene)
        }
      }
*/

      if (!loopComponent.action?.paused) playAnimationClip(animationComponent, loopComponent)
    }, [animComponent?.animations, loopAnimationComponent?.isVRM, loopAnimationComponent?.animationPack])

    return null
  }
})

export const playAnimationClip = (
  animationComponent: ComponentType<typeof AnimationComponent>,
  loopAnimationComponent: ComponentType<typeof LoopAnimationComponent>
) => {
  if (loopAnimationComponent.action) loopAnimationComponent.action.stop()
  if (
    loopAnimationComponent.activeClipIndex >= 0 &&
    animationComponent.animations[loopAnimationComponent.activeClipIndex]
  ) {
    animationComponent.mixer.stopAllAction()
    loopAnimationComponent.action = animationComponent.mixer
      .clipAction(
        AnimationClip.findByName(
          animationComponent.animations,
          animationComponent.animations[loopAnimationComponent.activeClipIndex].name
        )
      )
      .play()
  }
}
