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

import { useEffect } from 'react'
import {
  AdditiveAnimationBlendMode,
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  LoopPingPong,
  LoopRepeat,
  NormalAnimationBlendMode
} from 'three'

import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { NO_PROXY, isClient, useHookstate } from '@ir-engine/hyperflux'
import { StandardCallbacks, removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { retargetAnimationClips } from '../functions/retargetingFunctions'
import { setupMixamoAnimation } from '../systems/AvatarAnimationSystem'
import { AnimationComponent, useLoadAnimationFromGLTF } from './AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from './AvatarAnimationComponent'

const AnimationBlendMode = S.LiteralUnion(
  [NormalAnimationBlendMode, AdditiveAnimationBlendMode],
  NormalAnimationBlendMode
)

const AnimationActionLoopStyles = S.LiteralUnion([LoopOnce, LoopRepeat, LoopPingPong], LoopRepeat)

export const LoopAnimationComponent = defineComponent({
  name: 'LoopAnimationComponent',
  jsonID: 'EE_loop_animation',

  schema: S.Object({
    activeClipIndex: S.Number(-1),
    animationPack: S.String(''),
    useVRM: S.Bool(false),
    // TODO: support blending multiple animation actions. Refactor into AnimationMixerComponent and AnimationActionComponent
    enabled: S.Bool(true),
    paused: S.Bool(false),
    time: S.Number(0),
    timeScale: S.Number(1),
    blendMode: AnimationBlendMode,
    loop: AnimationActionLoopStyles,
    repetitions: S.NonSerialized(S.Number(Infinity)), //No longer serializable for now. We don't expose in editor anyway
    clampWhenFinished: S.Bool(false),
    zeroSlopeAtStart: S.Bool(true),
    zeroSlopeAtEnd: S.Bool(true),
    weight: S.Number(1),

    // internal
    _action: S.NonSerialized(S.Nullable(S.Type<AnimationAction>()))
  }),

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()

    const loopAnimationComponent = useComponent(entity, LoopAnimationComponent)
    const animComponent = useOptionalComponent(entity, AnimationComponent)
    const rigComponent = useOptionalComponent(entity, AvatarRigComponent)
    const lastAnimationPack = useHookstate('')
    useEffect(() => {
      if (!animComponent?.animations?.value || (loopAnimationComponent.useVRM.value && !rigComponent?.vrm.value)) return
      const clip = animComponent.animations.value[loopAnimationComponent.activeClipIndex.value] as AnimationClip
      if (!clip) {
        loopAnimationComponent._action.set(null)
        return
      }
      animComponent.mixer.time.set(0)
      const action = animComponent.mixer.value.clipAction(clip)
      loopAnimationComponent._action.set(action)
      return () => {
        action.stop()
      }
    }, [loopAnimationComponent.activeClipIndex, rigComponent?.vrm, animComponent?.animations])

    useEffect(() => {
      if (!loopAnimationComponent.useVRM.value && hasComponent(entity, AvatarRigComponent)) {
        removeComponent(entity, AvatarRigComponent)
        removeComponent(entity, AvatarAnimationComponent)
      } else if (loopAnimationComponent.useVRM.value && !hasComponent(entity, AvatarRigComponent)) {
        setComponent(entity, AvatarRigComponent)
        setComponent(entity, AvatarAnimationComponent)
        setComponent(entity, AnimationComponent, { mixer: new AnimationMixer(getComponent(entity, Object3DComponent)) })
      }
    }, [loopAnimationComponent.useVRM.value])

    const animationAction = loopAnimationComponent._action.value as AnimationAction

    useEffect(() => {
      if (!animationAction) return
      if (animationAction.isRunning()) {
        animationAction.paused = loopAnimationComponent.paused.value
      } else if (!animationAction.isRunning() && !loopAnimationComponent.paused.value) {
        if (animComponent) animComponent.mixer.value.stopAllAction()
        animationAction.paused = false
        animationAction.play()
      }
    }, [loopAnimationComponent._action, loopAnimationComponent.paused])

    useEffect(() => {
      if (!animationAction) return
      animationAction.enabled = loopAnimationComponent.enabled.value
    }, [loopAnimationComponent._action, loopAnimationComponent.enabled])

    useEffect(() => {
      if (!animationAction) return
      animationAction.time = loopAnimationComponent.time.value
      animationAction.setLoop(loopAnimationComponent.loop.value, loopAnimationComponent.repetitions.value ?? Infinity)
      animationAction.clampWhenFinished = loopAnimationComponent.clampWhenFinished.value
      animationAction.zeroSlopeAtStart = loopAnimationComponent.zeroSlopeAtStart.value
      animationAction.zeroSlopeAtEnd = loopAnimationComponent.zeroSlopeAtEnd.value
      animationAction.blendMode = loopAnimationComponent.blendMode.value
      animationAction.loop = loopAnimationComponent.loop.value
    }, [
      loopAnimationComponent._action,
      loopAnimationComponent.repetitions,
      loopAnimationComponent.blendMode,
      loopAnimationComponent.loop,
      loopAnimationComponent.clampWhenFinished,
      loopAnimationComponent.zeroSlopeAtStart,
      loopAnimationComponent.zeroSlopeAtEnd,
      loopAnimationComponent.activeClipIndex
    ])

    useEffect(() => {
      if (!animationAction) return
      animationAction.setEffectiveWeight(loopAnimationComponent.weight.value)
      animationAction.setEffectiveTimeScale(loopAnimationComponent.timeScale.value)
    }, [loopAnimationComponent._action, loopAnimationComponent.weight, loopAnimationComponent.timeScale])

    useEffect(() => {
      if (!animationAction) return
      animationAction.time = loopAnimationComponent.time.value
    }, [loopAnimationComponent.time])

    /**
     * Callback functions
     */
    useEffect(() => {
      const play = () => {
        loopAnimationComponent.paused.set(false)
      }
      const pause = () => {
        loopAnimationComponent.paused.set(true)
      }
      const stop = () => {
        loopAnimationComponent.paused.set(true)
        loopAnimationComponent.time.set(0)
        loopAnimationComponent._action.value?.stop()
      }
      setCallback(entity, StandardCallbacks.PLAY, play)
      setCallback(entity, StandardCallbacks.PAUSE, pause)
      setCallback(entity, StandardCallbacks.STOP, stop)

      return () => {
        removeCallback(entity, StandardCallbacks.PLAY)
        removeCallback(entity, StandardCallbacks.PAUSE)
        removeCallback(entity, StandardCallbacks.STOP)
      }
    }, [])

    const animationPackGLTF = useLoadAnimationFromGLTF(loopAnimationComponent.animationPack.value, true)
    const animationPackRigComponent = useOptionalComponent(entity, AvatarRigComponent)

    useEffect(() => {
      if (
        (!animationPackGLTF[0].value && loopAnimationComponent.animationPack.value !== '') ||
        !animComponent?.animations.value ||
        (loopAnimationComponent.animationPack.value !== '' &&
          lastAnimationPack.value === loopAnimationComponent.animationPack.value) ||
        loopAnimationComponent.animationPack.value === ''
      )
        return

      animComponent.mixer.time.set(0)
      animComponent.mixer.value.stopAllAction()

      setupMixamoAnimation(animationPackGLTF[1])
      retargetAnimationClips(animationPackGLTF[1])
      animComponent.animations.set(getComponent(animationPackGLTF[1], AnimationComponent).animations)
      lastAnimationPack.set(loopAnimationComponent.animationPack.get(NO_PROXY))
    }, [animationPackGLTF, animComponent])

    useEffect(() => {
      if (!animComponent?.animations) return
      const animations = animComponent.animations.value
      if (animations.length === 0) return
      const callbackNames: string[] = []
      for (let i = 0; i < animations.length; i++) {
        const clip = animations[i] as AnimationClip
        const callbackName = `Switch to Animation ${clip.name}`
        setCallback(entity, callbackName, () => {
          loopAnimationComponent.activeClipIndex.set(i)
        })
        callbackNames.push(callbackName)
      }
      return () => {
        for (const name of callbackNames) {
          removeCallback(entity, name)
        }
      }
    }, [animComponent?.animations, animationPackRigComponent?.bonesToEntities])

    return null
  }
})
