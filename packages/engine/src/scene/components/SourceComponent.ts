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

import { SceneID } from '@etherealengine/common/src/schema.type.module'
import { defineComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { createState, none } from '@etherealengine/hyperflux'

const entitiesBySource = {} as Record<SceneID, Entity[]>

export const SourceComponent = defineComponent({
  name: 'Source Component',
  onInit: (entity) => '' as SceneID,
  onSet: (entity, component, src: SceneID) => {
    if (typeof src !== 'string') throw new Error('SourceComponent expects a non-empty string')

    const currentSource = component.value

    if (currentSource !== '') {
      const currentEntities = SourceComponent.entitiesBySource[currentSource]
      const entities = currentEntities.filter((currentEntity) => currentEntity !== entity)
      if (entities.length === 0) {
        SourceComponent.entitiesBySourceState[currentSource].set(none)
      } else {
        SourceComponent.entitiesBySourceState[currentSource].set(entities)
      }
    }

    component.set(src)

    const nuEntities = SourceComponent.entitiesBySource[src] ?? []
    SourceComponent.entitiesBySourceState[src].set([...nuEntities, entity])
  },
  onRemove: (entity, component) => {
    const src = component.value

    const entities = SourceComponent.entitiesBySource[src].filter((currentEntity) => currentEntity !== entity)
    if (entities.length === 0) {
      SourceComponent.entitiesBySourceState[src].set(none)
    } else {
      SourceComponent.entitiesBySourceState[src].set(entities)
    }
  },
  entitiesBySourceState: createState(entitiesBySource),
  entitiesBySource: entitiesBySource as Readonly<typeof entitiesBySource>
})
