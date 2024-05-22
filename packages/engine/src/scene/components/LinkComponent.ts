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
import { Vector3 } from 'three'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { defineComponent, getComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { defineState, getMutableState, getState, matches } from '@etherealengine/hyperflux'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { XRStandardGamepadButton } from '@etherealengine/spatial/src/input/state/ButtonState'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'

import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { addError, clearErrors } from '../functions/ErrorFunctions'

const linkLogic = (linkComponent, xrState) => {
  if (!linkComponent.sceneNav) {
    xrState && xrState.session?.end()
    typeof window === 'object' && window && window.open(linkComponent.url, '_blank')
  } else {
    getMutableState(LinkState).location.set(linkComponent.location)
  }
}
const linkCallback = (linkEntity: Entity) => {
  const linkComponent = getComponent(linkEntity, LinkComponent)
  const buttons = InputComponent.getMergedButtons(linkEntity)
  if (buttons[XRStandardGamepadButton.Trigger]?.down) {
    const xrState = getState(XRState)
    linkLogic(linkComponent, xrState)
  } else {
    linkLogic(linkComponent, undefined)
  }
}

const vec3 = new Vector3()
const interactMessage = 'Click to follow'
const linkCallbackName = 'linkCallback'

export const LinkState = defineState({
  name: 'LinkState',
  initial: {
    location: undefined
  }
})

export const LinkComponent = defineComponent({
  name: 'LinkComponent',
  jsonID: 'EE_link',

  onInit: (entity) => {
    return {
      url: 'https://www.etherealengine.org',
      sceneNav: false,
      location: ''
    }
  },
  linkCallbackName,
  linkCallback,

  onSet: (entity, component, json) => {
    if (!json) return
    matches.string.test(json.url) && component.url.set(json.url as string)
    matches.boolean.test(json.sceneNav) && component.sceneNav.set(json.sceneNav as boolean)
    matches.string.test(json.location) && component.location.set(json.location as string)
  },

  interactMessage,

  toJSON: (entity, component) => {
    return {
      url: component.url.value,
      sceneNav: component.sceneNav.value,
      location: component.location.value
    }
  },

  errors: ['INVALID_URL'],

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const link = useComponent(entity, LinkComponent)

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
      setCallback(entity, linkCallbackName, () => LinkComponent.linkCallback(entity))
    }, [])

    return null
  }
})
