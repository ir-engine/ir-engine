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
import { Mesh } from 'three'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'

export const ShadowComponent = defineComponent({
  name: 'ShadowComponent',
  jsonID: 'EE_shadow',

  schema: S.Object({
    cast: S.Bool(true),
    receive: S.Bool(true)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const shadowComponent = useComponent(entity, ShadowComponent)
    const object = useComponent(entity, ObjectComponent).get(NO_PROXY) as Mesh

    useEffect(() => {
      object.castShadow = shadowComponent.cast.value
      object.receiveShadow = shadowComponent.receive.value
    }, [!!object, shadowComponent.cast, shadowComponent.receive])

    return null
  }
})
