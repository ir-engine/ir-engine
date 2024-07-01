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

import matches from 'ts-matches'

import { defineComponent, EntityUUID, useEntityContext } from '@etherealengine/ecs'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { useEffect } from 'react'

export const TriggerComponent = defineComponent({
  name: 'TriggerComponent',
  jsonID: 'EE_trigger',

  onInit(entity) {
    return {
      triggers: [] as Array<{
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        onEnter: null | string
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
         */
        onExit: null | string
        /**
         * empty string represents self
         */
        target: null | EntityUUID
      }>
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    // backwards compatibility
    const onEnter = (json as any).onEnter ?? null
    const onExit = (json as any).onExit ?? null
    const target = (json as any).target ?? null
    if (!!onEnter || !!onExit || !!target) {
      component.triggers.set([{ onEnter, onExit, target }])
    } else if (typeof json.triggers === 'object') {
      if (
        matches
          .arrayOf(
            matches.shape({
              onEnter: matches.nill.orParser(matches.string),
              onExit: matches.nill.orParser(matches.string),
              target: matches.nill.orParser(matches.string)
            })
          )
          .test(json.triggers)
      ) {
        component.triggers.set(json.triggers)
      }
    }
  },

  toJSON(entity, component) {
    return {
      triggers: component.triggers.get(NO_PROXY)
    }
  },

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {}, [])

    return null
  }
})
