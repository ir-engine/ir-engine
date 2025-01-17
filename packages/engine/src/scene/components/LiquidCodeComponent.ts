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

import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { isClient } from '@ir-engine/hyperflux'
import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
const interactMessage = 'Click'

export const enum LiquidCodeCallbacks {
  OPEN = 'open',
  CLOSE = 'close'
}

const liquidCodeCallbackName = 'liquidCodeCallback'

export const LiquidCodeComponent = defineComponent({
  name: 'LiquidCodeComponent',
  jsonID: 'ir_liquid_code',

  schema: S.Object({
    // TODO: instead of just liquidCode, allow web links?
    liquidCode: S.String(''),
    isOpen: S.Bool(false)
  }),

  liquidCodeCallbackName,
  interactMessage,
  errors: ['INVALID_URL'],

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const liquidCode = useComponent(entity, LiquidCodeComponent)

    useEffect(() => {
      const toggleOpen = () => {
        liquidCode.isOpen.set(!liquidCode.isOpen.value)
      }

      setCallback(entity, liquidCodeCallbackName, toggleOpen)

      return () => {
        setCallback(entity, liquidCodeCallbackName, null)
      }
    }, [entity, liquidCode])

    return null
  }
})
