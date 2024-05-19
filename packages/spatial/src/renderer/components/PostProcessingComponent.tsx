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

import { defineComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { NO_PROXY_STEALTH } from '@etherealengine/hyperflux'

import { defaultPostProcessingSchema, EffectPropsSchema } from '../effects/PostProcessing'
import { configureEffectComposer } from '../functions/configureEffectComposer'
import { useScene } from './SceneComponents'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'EE_postprocessing',

  onInit(entity) {
    return {
      enabled: false,
      effects: defaultPostProcessingSchema
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.enabled === 'boolean') component.enabled.set(json.enabled)
    if (typeof json.effects === 'object') component.merge({ effects: json.effects })
  },

  toJSON: (entity, component) => {
    return {
      effects: component.effects.value,
      enabled: component.enabled.value
    }
  },

  /** @todo this will be replaced with spatial queries or distance checks */
  reactor: () => {
    const entity = useEntityContext()
    const rendererEntity = useScene(entity)
    const postprocessingComponent = useComponent(entity, PostProcessingComponent)

    useEffect(() => {
      if (!rendererEntity) return
      configureEffectComposer(
        rendererEntity,
        postprocessingComponent.enabled.value
          ? (postprocessingComponent.effects.get(NO_PROXY_STEALTH) as EffectPropsSchema)
          : undefined
      )
    }, [rendererEntity, postprocessingComponent.enabled, postprocessingComponent.effects])

    return null
  }
})
