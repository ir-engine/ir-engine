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

import React, { ReactElement, useEffect } from 'react'

import { NO_PROXY, getMutableState, getState } from '@etherealengine/hyperflux'

import { defineComponent, getComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EngineRenderer, PostProcessingSettingsState } from '../../renderer/WebGLRendererSystem'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'postprocessing',

  onInit(entity): typeof PostProcessingSettingsState._TYPE {
    return typeof PostProcessingSettingsState.initial === 'function'
      ? (PostProcessingSettingsState.initial as any)()
      : JSON.parse(JSON.stringify(PostProcessingSettingsState.initial))
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.enabled) component.enabled.set(json.enabled)
    if (json.effects) {
      for (const [name, effect] of Object.entries(json.effects)) {
        component.effects[name].merge(effect)
      }
    }
  },

  toJSON: (entity, component) => {
    return component.get(NO_PROXY)
  },

  reactor: PostProcessingComponentReactor
})

function PostProcessingComponentReactor(): ReactElement {
  const entity = useEntityContext()
  const component = useComponent(entity, PostProcessingComponent)

  useEffect(() => {
    getMutableState(PostProcessingSettingsState).enabled.set(component.enabled.value)
  }, [component.enabled])

  if (!EngineRenderer.instance.effectComposer) return <></>

  return (
    <>
      {Object.entries(getComponent(entity, PostProcessingComponent).effects)
        .map(([name, effect]) =>
          Object.entries(effect).map(([key, value]) => (
            <PostProcessingEffectPropertyReactor
              effectState={component.effects[name]}
              effectName={name}
              property={key}
              key={name + key}
              value={value}
            />
          ))
        )
        .flat()}
    </>
  )
}

const PostProcessingEffectPropertyReactor = (props: {
  effectName: string
  effectState
  property: string
  value: any
}) => {
  const { effectName, effectState, property, value } = props

  useEffect(() => {
    // escape if undefined, as state is not yet initialized or schema is invalid
    if (typeof getState(PostProcessingSettingsState).effects[effectName]?.[property] === 'undefined') return

    getMutableState(PostProcessingSettingsState).effects[effectName][property].set(value)
    const effect = EngineRenderer.instance.effectComposer[effectName]
    if (effect && property in effect) {
      effect[property] = value
    }
    if (property === 'isActive') {
      configureEffectComposer()
    }
  }, [value, effectState[property]])

  return null
}
