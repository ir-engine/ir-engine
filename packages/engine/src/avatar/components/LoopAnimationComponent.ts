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
import {
  AnimationAction,
  AnimationActionLoopStyles,
  AnimationBlendMode,
  AnimationClip,
  AnimationMixer,
  LoopRepeat,
  NormalAnimationBlendMode
} from 'three'

import { VRM } from '@pixiv/three-vrm'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import {
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { CallbackComponent, StandardCallbacks, setCallback } from '../../scene/components/CallbackComponent'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { parseAvatarModelAsset } from '../functions/avatarFunctions'
import { retargetMixamoAnimation } from '../functions/retargetMixamoRig'
import { AnimationComponent } from './AnimationComponent'

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  jsonID: 'loop-animation',

  onInit: (entity) => {
    return {
      hasAvatarAnimations: false,
      activeClipIndex: -1,
      animationPack: '',

      // TODO: support blending multiple animation actions. Refactor into AnimationMixerComponent and AnimationActionComponent
      paused: false,
      enabled: true,
      time: 0,
      timeScale: 1,
      blendMode: NormalAnimationBlendMode as AnimationBlendMode,
      loop: LoopRepeat as AnimationActionLoopStyles,
      repetitions: Infinity,
      clampWhenFinished: false,
      zeroSlopeAtStart: true,
      zeroSlopeAtEnd: true,
      weight: 1,

      // internal
      _action: null as AnimationAction | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.hasAvatarAnimations === 'boolean') component.hasAvatarAnimations.set(json.hasAvatarAnimations)
    if (typeof json.activeClipIndex === 'number') component.activeClipIndex.set(json.activeClipIndex)
    if (typeof json.animationPack === 'string') component.animationPack.set(json.animationPack)
    if (typeof json.paused === 'number') component.paused.set(json.paused)
    if (typeof json.time === 'number') component.time.set(json.time)
    if (typeof json.timeScale === 'number') component.timeScale.set(json.timeScale)
    if (typeof json.blendMode === 'number') component.blendMode.set(json.blendMode)
    if (typeof json.loop === 'number') component.loop.set(json.loop)
    if (typeof json.repetitions === 'number') component.repetitions.set(json.repetitions)
    if (typeof json.clampWhenFinished === 'boolean') component.clampWhenFinished.set(json.clampWhenFinished)
    if (typeof json.zeroSlopeAtStart === 'boolean') component.zeroSlopeAtStart.set(json.zeroSlopeAtStart)
    if (typeof json.zeroSlopeAtEnd === 'boolean') component.zeroSlopeAtEnd.set(json.zeroSlopeAtEnd)
    if (typeof json.weight === 'number') component.weight.set(json.weight)
  },

  toJSON: (entity, component) => {
    return {
      activeClipIndex: component.activeClipIndex.value,
      animationPack: component.animationPack.value,
      paused: component.paused.value,
      time: component.time.value,
      timeScale: component.timeScale.value,
      blendMode: component.blendMode.value,
      loop: component.loop.value,
      clampWhenFinished: component.clampWhenFinished.value,
      zeroSlopeAtStart: component.zeroSlopeAtStart.value,
      zeroSlopeAtEnd: component.zeroSlopeAtEnd.value,
      weight: component.weight.value
    }
  },

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()

    const loopAnimationComponent = useComponent(entity, LoopAnimationComponent)

    const modelComponent = useOptionalComponent(entity, ModelComponent)

    const animComponent = useOptionalComponent(entity, AnimationComponent)

    useEffect(() => {
      if (!animComponent || !modelComponent?.scene?.value) {
        loopAnimationComponent._action.set(null)
        return
      }
      animComponent.mixer.time.set(0)
      const clip = AnimationClip.findByName(
        animComponent.animations.value,
        animComponent.animations[loopAnimationComponent.activeClipIndex.value].name.value
      )
      const action = animComponent.mixer.value.clipAction(
        modelComponent.asset instanceof VRM
          ? retargetMixamoAnimation(clip, modelComponent.scene.value, modelComponent.asset)
          : clip
      )
      loopAnimationComponent._action.set(action)
      return () => {
        void action.stop()
      }
    }, [animComponent, loopAnimationComponent.activeClipIndex])

    useEffect(() => {
      if (loopAnimationComponent._action.value?.isRunning() && loopAnimationComponent.paused.value) {
        loopAnimationComponent._action.value.paused = true
      } else if (loopAnimationComponent._action.value?.isRunning() && !loopAnimationComponent.paused.value) {
        loopAnimationComponent._action.value?.play()
      }
    }, [loopAnimationComponent._action, loopAnimationComponent.paused])

    useEffect(() => {
      if (!loopAnimationComponent._action.value) return
      loopAnimationComponent._action.value.enabled = loopAnimationComponent.enabled.value
    }, [loopAnimationComponent._action, loopAnimationComponent.enabled])

    useEffect(() => {
      if (!loopAnimationComponent._action.value) return
      loopAnimationComponent._action.value.time = loopAnimationComponent.time.value
      loopAnimationComponent._action.value.setLoop(
        loopAnimationComponent.loop.value,
        loopAnimationComponent.repetitions.value
      )
      loopAnimationComponent._action.value.clampWhenFinished = loopAnimationComponent.clampWhenFinished.value
      loopAnimationComponent._action.value.zeroSlopeAtStart = loopAnimationComponent.zeroSlopeAtStart.value
      loopAnimationComponent._action.value.zeroSlopeAtEnd = loopAnimationComponent.zeroSlopeAtEnd.value
      loopAnimationComponent._action.value.blendMode = loopAnimationComponent.blendMode.value
    }, [
      loopAnimationComponent._action,
      loopAnimationComponent.time,
      loopAnimationComponent.blendMode,
      loopAnimationComponent.loop,
      loopAnimationComponent.clampWhenFinished,
      loopAnimationComponent.zeroSlopeAtStart,
      loopAnimationComponent.zeroSlopeAtEnd
    ])

    useEffect(() => {
      if (!loopAnimationComponent._action.value) return
      loopAnimationComponent._action.value.setEffectiveWeight(loopAnimationComponent.weight.value)
      loopAnimationComponent._action.value.setEffectiveTimeScale(loopAnimationComponent.timeScale.value)
    }, [loopAnimationComponent._action, loopAnimationComponent.weight, loopAnimationComponent.timeScale])

    /**
     * Callback functions
     */
    useEffect(() => {
      if (hasComponent(entity, CallbackComponent)) return
      const play = () => {
        loopAnimationComponent.paused.set(false)
      }
      const pause = () => {
        loopAnimationComponent.paused.set(true)
      }
      setCallback(entity, StandardCallbacks.PLAY, play)
      setCallback(entity, StandardCallbacks.PAUSE, pause)
    }, [])

    /**
     * A model is required for LoopAnimationComponent.
     */
    useEffect(() => {
      if (!modelComponent?.scene?.value) return
      const model = getComponent(entity, ModelComponent)
      if (loopAnimationComponent.hasAvatarAnimations.value && !(model.asset as VRM)?.humanoid) {
        const vrm = parseAvatarModelAsset(model.scene)
        if (vrm) {
          modelComponent.asset.set(vrm)
        }
      } else if (model.asset instanceof VRM) {
        loopAnimationComponent.hasAvatarAnimations.set(true)
      }

      if (!hasComponent(entity, AnimationComponent)) {
        setComponent(entity, AnimationComponent, {
          mixer: new AnimationMixer(model.scene!),
          animations: []
        })
      }
    }, [modelComponent?.scene, loopAnimationComponent.hasAvatarAnimations])

    useEffect(() => {
      if (!modelComponent?.scene?.value || !animComponent || !loopAnimationComponent.animationPack.value) return

      AssetLoader.loadAsync(loopAnimationComponent?.animationPack.value).then((model) => {
        const animations = model.userData ? model.animations : model.scene.animations
        animComponent.animations.set(animations)
      })
    }, [modelComponent?.asset, loopAnimationComponent.animationPack])

    return null
  }
})
