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
import { Vector3 } from 'three'

import { defineComponent, getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { defineState, getMutableState, getState, isClient } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { addError, clearErrors } from '../functions/ErrorFunctions'

const linkLogic = (linkEntity: Entity, xrState) => {
  const linkComponent = getComponent(linkEntity, LinkComponent)
  if (!linkComponent.sceneNav) {
    xrState && xrState.session?.end()
    typeof window === 'object' && window && window.open(linkComponent.url, '_blank')
  } else {
    getMutableState(LinkState).location.set(linkComponent.location)
  }
}
const linkCallback = (linkEntity: Entity) => {
  const buttons = InputComponent.getMergedButtons(linkEntity)
  if (buttons.XRStandardGamepadTrigger?.down) {
    const xrState = getState(XRState)
    linkLogic(linkEntity, xrState)
  } else {
    linkLogic(linkEntity, undefined)
  }
}

const vec3 = new Vector3()
const interactMessage = 'Click to follow'
const linkCallbackName = 'linkCallback'

export const LinkState = defineState({
  name: 'LinkState',
  initial: {
    location: undefined as undefined | string
  }
})

export const LinkComponent = defineComponent({
  name: 'LinkComponent',
  jsonID: 'EE_link',

  schema: S.Object({
    url: S.String(''),
    sceneNav: S.Bool(false),
    location: S.String('')
  }),

  linkCallbackName,
  linkCallback,
  interactMessage,

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
