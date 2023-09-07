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
import { AnimationAction, AnimationClip, AnimationMixer, Object3D } from 'three'

import { VRM } from '@pixiv/three-vrm'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { Entity } from '../../ecs/classes/Entity'
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
      animationSpeed: 1,
      activeClipIndex: -1,
      animationPack: '',
      // internal
      animationPackScene: undefined as Object3D | undefined,
      action: null as AnimationAction | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.hasAvatarAnimations === 'boolean') component.hasAvatarAnimations.set(json.hasAvatarAnimations)
    if (typeof json.activeClipIndex === 'number') component.activeClipIndex.set(json.activeClipIndex)
    if (typeof json.animationSpeed === 'number') component.animationSpeed.set(json.animationSpeed)
    if (typeof json.animationPack === 'string') component.animationPack.set(json.animationPack)
  },

  toJSON: (entity, component) => {
    return {
      activeClipIndex: component.activeClipIndex.value,
      animationPack: component.animationPack.value,
      animationSpeed: component.animationSpeed.value,
      hasAvatarAnimations: component.hasAvatarAnimations.value
    }
  },

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()

    const loopAnimationComponent = useComponent(entity, LoopAnimationComponent)

    const modelComponent = useOptionalComponent(entity, ModelComponent)

    const animComponent = useOptionalComponent(entity, AnimationComponent)

    /**
     * Callback functions
     */
    useEffect(() => {
      if (hasComponent(entity, CallbackComponent)) return
      const play = () => {
        playAnimationClip(entity)
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
          modelComponent.scene.set(vrm.scene as any)
        }
      } else if (model.asset instanceof VRM) {
        loopAnimationComponent.hasAvatarAnimations.set(true)
      }

      if (!hasComponent(entity, AnimationComponent)) {
        setComponent(entity, AnimationComponent, {
          mixer: new AnimationMixer(model.scene!),
          animations: []
        })
        getComponent(entity, AnimationComponent).mixer.timeScale = loopAnimationComponent.animationSpeed.value
      }
    }, [modelComponent?.scene, loopAnimationComponent.hasAvatarAnimations])

    useEffect(() => {
      if (!animComponent) return
      animComponent.mixer.timeScale.set(loopAnimationComponent.animationSpeed.value)
    }, [animComponent, loopAnimationComponent.animationSpeed])

    useEffect(() => {
      if (!modelComponent?.scene?.value || !animComponent || !loopAnimationComponent.animationPack.value) return

      AssetLoader.loadAsync(loopAnimationComponent?.animationPack.value).then((model) => {
        const animations = model.userData ? model.animations : model.scene.animations
        loopAnimationComponent.animationPackScene.set(model.scene)
        const animationComponent = getComponent(entity, AnimationComponent)
        animationComponent.animations = animations
      })
    }, [modelComponent?.scene, modelComponent?.asset, animComponent?.animations, loopAnimationComponent.animationPack])

    useEffect(() => {
      if (
        !modelComponent?.scene?.value ||
        !modelComponent.asset.value ||
        (modelComponent.asset.value instanceof VRM && !loopAnimationComponent.animationPackScene.value)
      )
        return

      playAnimationClip(entity)
    }, [loopAnimationComponent.activeClipIndex, loopAnimationComponent.animationPackScene, modelComponent?.scene])

    return null
  }
})

export const playAnimationClip = (entity: Entity) => {
  const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
  const animationComponent = getComponent(entity, AnimationComponent)
  const modelComponent = getComponent(entity, ModelComponent)
  if (loopAnimationComponent.action) loopAnimationComponent.action.stop()
  if (
    loopAnimationComponent.activeClipIndex >= 0 &&
    animationComponent.animations[loopAnimationComponent.activeClipIndex]
  ) {
    animationComponent.mixer.stopAllAction()
    const clip = AnimationClip.findByName(
      animationComponent.animations,
      animationComponent.animations[loopAnimationComponent.activeClipIndex].name
    )

    animationComponent.mixer.time = 0
    loopAnimationComponent.action = animationComponent.mixer
      .clipAction(
        modelComponent.asset instanceof VRM
          ? retargetMixamoAnimation(clip, loopAnimationComponent.animationPackScene!, modelComponent.asset)
          : clip
      )
      .play()
  }
}
