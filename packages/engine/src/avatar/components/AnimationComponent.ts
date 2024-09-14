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

import { AnimationClip, AnimationMixer } from 'three'

import { generateEntityUUID, removeEntity } from '@ir-engine/ecs'
import { defineComponent, getComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { GLTFAssetState } from '../../gltf/GLTFState'

export const AnimationComponent = defineComponent({
  name: 'AnimationComponent',

  onInit: (entity) => {
    return {
      mixer: null! as AnimationMixer,
      animations: [] as AnimationClip[]
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.mixer) component.mixer.set(json.mixer)
    if (json.animations) component.animations.set(json.animations as AnimationClip[])
  }
})

export const useLoadAnimationFromGLTF = (url: string) => {
  const assetEntity = useMutableState(GLTFAssetState)[url].value
  const animation = useHookstate(null as AnimationClip[] | null)
  const animationComponent = useOptionalComponent(assetEntity, AnimationComponent)

  useEffect(() => {
    if (animation.value) return
    if (!assetEntity) {
      GLTFAssetState.loadScene(url, generateEntityUUID())
      return
    }
  }, [useOptionalComponent(assetEntity, GLTFComponent)?.progress])

  useEffect(() => {
    if (!animationComponent?.animations || !animationComponent.animations.length) return
    animation.set(getComponent(assetEntity, AnimationComponent).animations)
    removeEntity(assetEntity)
  }, [animationComponent?.animations])
  return animation
}
