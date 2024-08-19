/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { VRM } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import {
  AnimationAction,
  AnimationActionLoopStyles,
  AnimationBlendMode,
  AnimationClip,
  LoopRepeat,
  NormalAnimationBlendMode
} from 'three'

import { isClient } from '@ir-engine/common/src/utils/getEnvironment'
import {
  defineComponent,
  getComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { CallbackComponent, StandardCallbacks, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

import { useGLTF } from '../../assets/functions/resourceLoaderHooks'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { bindAnimationClipFromMixamo, retargetAnimationClip } from '../functions/retargetMixamoRig'
import { AnimationComponent } from './AnimationComponent'

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  jsonID: 'EE_loop_animation',

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
    const animationAction = loopAnimationComponent._action.value as AnimationAction

    const lastAnimationPack = useHookstate('')
    useEffect(() => {
      if (!animComponent?.animations?.value) return
      const clip = animComponent.animations.value[loopAnimationComponent.activeClipIndex.value] as AnimationClip
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
    }, [loopAnimationComponent.activeClipIndex, modelComponent?.asset, animComponent?.animations])

    useEffect(() => {
      if (animationAction?.isRunning()) {
        animationAction.paused = loopAnimationComponent.paused.value
      } else if (!animationAction?.isRunning() && !loopAnimationComponent.paused.value) {
        animationAction?.getMixer().stopAllAction()
        animationAction?.reset()
        animationAction?.play()
      }
    }, [loopAnimationComponent._action, loopAnimationComponent.paused])

    useEffect(() => {
      if (!animationAction) return
      animationAction.enabled = loopAnimationComponent.enabled.value
    }, [loopAnimationComponent._action, loopAnimationComponent.enabled])

    useEffect(() => {
      if (!animationAction) return
      animationAction.time = loopAnimationComponent.time.value
      animationAction.setLoop(loopAnimationComponent.loop.value, loopAnimationComponent.repetitions.value)
      animationAction.clampWhenFinished = loopAnimationComponent.clampWhenFinished.value
      animationAction.zeroSlopeAtStart = loopAnimationComponent.zeroSlopeAtStart.value
      animationAction.zeroSlopeAtEnd = loopAnimationComponent.zeroSlopeAtEnd.value
      animationAction.blendMode = loopAnimationComponent.blendMode.value
    }, [
      loopAnimationComponent._action,
      loopAnimationComponent.blendMode,
      loopAnimationComponent.loop,
      loopAnimationComponent.clampWhenFinished,
      loopAnimationComponent.zeroSlopeAtStart,
      loopAnimationComponent.zeroSlopeAtEnd
    ])

    useEffect(() => {
      if (!animationAction) return
      animationAction.setEffectiveWeight(loopAnimationComponent.weight.value)
      animationAction.setEffectiveTimeScale(loopAnimationComponent.timeScale.value)
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
    }, [modelComponent?.asset])

    const [gltf] = useGLTF(loopAnimationComponent.animationPack.value, entity)

    useEffect(() => {
      const asset = modelComponent?.asset.get(NO_PROXY) ?? null
      if (
        !gltf ||
        !animComponent ||
        !asset?.scene ||
        !loopAnimationComponent.animationPack.value ||
        lastAnimationPack.value === loopAnimationComponent.animationPack.value
      )
        return

      animComponent.mixer.time.set(0)
      animComponent.mixer.value.stopAllAction()
      const animations = gltf.animations
      for (let i = 0; i < animations.length; i++) retargetAnimationClip(animations[i], gltf.scene)
      lastAnimationPack.set(loopAnimationComponent.animationPack.get(NO_PROXY))
      animComponent.animations.set(animations)
    }, [gltf, animComponent, modelComponent?.asset])

    return null
  }
})
