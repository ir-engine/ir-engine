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

import { getState } from '@etherealengine/hyperflux'
import { matches } from '../../common/functions/MatchesUtils'
import { isClient } from '../../common/functions/getEnvironment'
import { SceneServices } from '../../ecs/classes/Scene'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { InputSystemGroup } from '../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '../../input/state/ButtonState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { XRState } from '../../xr/XRState'
import { addError, clearErrors } from '../functions/ErrorFunctions'

const linkLogic = (linkComponent, xrState) => {
  if (!linkComponent.sceneNav) {
    xrState && xrState.session?.end()
    typeof window === 'object' && window && window.open(linkComponent.url, '_blank')
  } else {
    SceneServices.setCurrentScene(linkComponent.projectName, linkComponent.sceneName)
  }
}

export const LinkComponent = defineComponent({
  name: 'LinkComponent',
  jsonID: 'link',

  onInit: (entity) => {
    return {
      url: 'https://www.etherealengine.org',
      sceneNav: false,
      projectName: '',
      sceneName: ''
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    matches.string.test(json.url) && component.url.set(json.url as string)
    matches.boolean.test(json.sceneNav) && component.sceneNav.set(json.sceneNav as boolean)
    matches.string.test(json.projectName) && component.projectName.set(json.projectName as string)
    matches.string.test(json.sceneName) && component.sceneName.set(json.sceneName as string)
  },

  toJSON: (entity, component) => {
    return {
      url: component.url.value,
      sceneNav: component.sceneNav.value,
      projectName: component.projectName.value,
      sceneName: component.sceneName.value
    }
  },

  errors: ['INVALID_URL', 'INVALID_PATH'],

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const link = useComponent(entity, LinkComponent)
    const input = useComponent(entity, InputComponent)

    useEffect(() => {
      const canvas = EngineRenderer.instance.renderer.domElement
      if (input.inputSources.length > 0) {
        canvas.style.cursor = 'pointer'
      }
      return () => {
        canvas.style.cursor = 'auto'
      }
    }, [input.inputSources])

    useEffect(() => {
      clearErrors(entity, LinkComponent)
      if (link.sceneNav.value) return
      try {
        new URL(link.url.value)
      } catch {
        return addError(entity, LinkComponent, 'INVALID_URL', 'Please enter a valid URL.')
      }
      return
    }, [link.url, link.sceneNav])

    useEffect(() => {
      setComponent(entity, InputComponent)
    }, [])

    useExecute(
      () => {
        const linkComponent = getComponent(entity, LinkComponent)
        const inputComponent = getComponent(entity, InputComponent)
        const inputSourceEntity = inputComponent?.inputSources[0]

        if (inputSourceEntity) {
          const inputSource = getOptionalComponent(inputSourceEntity, InputSourceComponent)
          const buttons = inputSource?.buttons

          if (buttons)
            if (buttons.PrimaryClick?.touched) {
              if (buttons.PrimaryClick.up) {
                linkLogic(linkComponent, undefined)
              }
            } else if (buttons[XRStandardGamepadButton.Trigger]?.down) {
              const xrState = getState(XRState)
              linkLogic(linkComponent, xrState)
            }
        }
      },
      { with: InputSystemGroup }
    )

    return null
  }
})
