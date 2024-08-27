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
import { Object3D } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { matches } from '@ir-engine/hyperflux'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { Type } from '@sinclair/typebox'

export const ShadowComponent = defineComponent({
  name: 'ShadowComponent',
  jsonID: 'EE_shadow',

  schema: Type.Object({
    cast: Type.Boolean({ default: true }),
    receive: Type.Boolean({ default: true })
  }),

  toJSON: (entity, component) => {
    return {
      cast: component.cast.value,
      receive: component.receive.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.boolean.test(json.cast)) component.cast.set(json.cast)
    if (matches.boolean.test(json.receive)) component.receive.set(json.receive)
  },

  reactor: () => {
    const entity = useEntityContext()
    const shadowComponent = useComponent(entity, ShadowComponent)
    const groupComponent = useComponent(entity, GroupComponent)

    useEffect(() => {
      for (const obj of groupComponent.value) {
        const object = obj as Object3D
        object.castShadow = shadowComponent.cast.value
        object.receiveShadow = shadowComponent.receive.value
      }
    }, [groupComponent, shadowComponent.cast, shadowComponent.receive])

    return null
  }
})
