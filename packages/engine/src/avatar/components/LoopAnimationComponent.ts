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
  AnimationMixer,
  LoopRepeat,
  NormalAnimationBlendMode
} from 'three'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import {
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { CallbackComponent, StandardCallbacks, setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { VRM } from '@pixiv/three-vrm'
import { useGLTF } from '../../assets/functions/resourceHooks'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { bindAnimationClipFromMixamo, retargetAnimationClip } from '../functions/retargetMixamoRig'
import { AnimationComponent } from './AnimationComponent'

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  jsonID: 'loop-animation',

  onInit: (entity) => {
    return {
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
    if (typeof (json as any).animationSpeed === 'number') component.timeScale.set((json as any).animationSpeed) // backwards-compat
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
    const lastAnimationPack = useHookstate('')

    useEffect(() => {
      if (!animComponent?.animations?.value) return
      const clip = animComponent.animations.value[loopAnimationComponent.activeClipIndex.value]
      const asset = modelComponent?.asset.get(NO_PROXY) ?? null
      if (!modelComponent || !asset?.scene || !clip) {
        loopAnimationComponent._action.set(null)
        return
      }
      animComponent.mixer.time.set(0)
      const assetObject = modelComponent.asset.get(NO_PROXY)
      try {
        const action = animComponent.mixer.value.clipAction(
          assetObject instanceof VRM ? bindAnimationClipFromMixamo(clip, assetObject) : clip
        )
        loopAnimationComponent._action.set(action)
        return () => {
          action.stop()
        }
      } catch (e) {
        console.warn('Failed to bind animation in LoopAnimationComponent', entity, e)
      }
    }, [animComponent?.animations, loopAnimationComponent.activeClipIndex, modelComponent?.asset])

    useEffect(() => {
      if (loopAnimationComponent._action.value?.isRunning()) {
        loopAnimationComponent._action.value.paused = loopAnimationComponent.paused.value
      } else if (!loopAnimationComponent._action.value?.isRunning() && !loopAnimationComponent.paused.value) {
        loopAnimationComponent._action.value?.getMixer().stopAllAction()
        loopAnimationComponent._action.value?.reset()
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
      const asset = modelComponent?.asset.get(NO_PROXY) ?? null
      if (!asset?.scene) return
      const model = getComponent(entity, ModelComponent)

      if (!hasComponent(entity, AnimationComponent)) {
        setComponent(entity, AnimationComponent, {
          mixer: new AnimationMixer(model.asset!.scene)
        })
      }
    }, [modelComponent?.asset])

    const [gltf, unload] = useGLTF(loopAnimationComponent.animationPack.value, entity)

    useEffect(() => {
      return unload
    }, [])

    useEffect(() => {
      const asset = modelComponent?.asset.get(NO_PROXY) ?? null
      const model = gltf.get(NO_PROXY)
      if (
        !model ||
        !animComponent ||
        !asset?.scene ||
        !loopAnimationComponent.animationPack.value ||
        lastAnimationPack.value === loopAnimationComponent.animationPack.value
      )
        return

      animComponent.mixer.time.set(0)
      const animations = model.animations ?? model.scene.animations
      for (let i = 0; i < animations.length; i++) retargetAnimationClip(animations[i], model.scene)
      lastAnimationPack.set(loopAnimationComponent.animationPack.get(NO_PROXY))
      animComponent.animations.set(animations)
    }, [gltf, animComponent, loopAnimationComponent.animationPack])

    return null
  }
})
