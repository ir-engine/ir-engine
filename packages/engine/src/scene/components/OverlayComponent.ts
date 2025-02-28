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

import { defineComponent, getComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

import { Entity } from '@ir-engine/ecs/src/Entity'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { addError, clearErrors } from '../functions/ErrorFunctions'

const interactMessage = 'Click'
const overlayCallbackName = 'onOpenMenu'

const toggleOpen = (overlayEntity: Entity) => {
  const overlayComponent = getComponent(overlayEntity, OverlayComponent)
  setComponent(overlayEntity, OverlayComponent, { isOpen: !overlayComponent.isOpen })
}

export const OverlayComponent = defineComponent({
  name: 'OverlayComponent',
  jsonID: 'IR_overlay_component',

  schema: S.Object({
    src: S.String(''),
    type: S.String(''),
    isOpen: S.NonSerialized(S.Bool(false)),
    props: S.Any()
  }),

  overlayCallbackName,
  interactMessage,
  toggleOpen,

  errors: ['INVALID_URL'],

  reactor: function () {
    const entity = useEntityContext()
    const overlayComponent = useComponent(entity, OverlayComponent)

    useEffect(() => {
      clearErrors(entity, OverlayComponent)
      if (overlayComponent.src.value) return
      try {
        new URL(overlayComponent.src.value)
      } catch {
        return addError(entity, OverlayComponent, 'INVALID_URL', 'Please enter a valid URL.')
      }
      return
    }, [overlayComponent.src])

    useEffect(() => {
      setCallback(entity, overlayCallbackName, () => toggleOpen(entity))
      return () => {
        removeCallback(entity, overlayCallbackName)
      }
    }, [])

    return null
  }
})
