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

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { hookstate, none } from '@ir-engine/hyperflux'

const entitiesByName = {} as Record<string, Entity[]>

export const NameComponent = defineComponent({
  name: 'NameComponent',

  onInit: () => '' as string,

  onSet: (entity, component, name?: string) => {
    if (typeof name !== 'string') throw new Error('NameComponent expects a non-empty string')
    // remove the entity from the previous name state
    if (component.value && entitiesByName[component.value]) {
      const index = entitiesByName[component.value].indexOf(entity)
      NameComponent.entitiesByNameState[component.value][index].set(none)
      if (!entitiesByName[component.value].length) NameComponent.entitiesByNameState[component.value].set(none)
    }
    // set the new name
    component.set(name)
    // add the entity to the new name state
    const exists = NameComponent.entitiesByName[name]
    const entitiesByNameState = NameComponent.entitiesByNameState
    if (exists) {
      if (!exists.includes(entity)) entitiesByNameState.merge({ [name]: [...exists, entity] })
    } else entitiesByNameState.merge({ [name]: [entity] })
  },

  onRemove: (entity, component) => {
    const name = component.value
    const namedEntities = NameComponent.entitiesByNameState[name]
    const isSingleton = namedEntities.length === 1
    isSingleton && namedEntities.set(none)
    !isSingleton && namedEntities.set(namedEntities.value.filter((namedEntity) => namedEntity !== entity))
  },

  entitiesByNameState: hookstate(entitiesByName),
  entitiesByName: entitiesByName as Readonly<typeof entitiesByName>
})
