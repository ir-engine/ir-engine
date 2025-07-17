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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  defineComponent,
  Entity,
  entityExists,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  removeComponent,
  setComponent,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY, none, State } from '@ir-engine/hyperflux'

export const ResourceProgressComponent = defineComponent({
  name: 'ResourceProgressComponent',

  schema: S.Record(
    S.String(),
    S.Object({
      progress: S.Number()
    })
  ),

  setResource(entity: Entity, url: string, progress: number, total: number) {
    if (!entityExists(entity)) return
    setComponent(entity, ResourceProgressComponent)

    const percentage = total ? Math.floor((progress / total) * 100) : 0
    const component = getMutableComponent(entity, ResourceProgressComponent)
    component.merge({ [url]: { progress: percentage } })
  },

  removeResource(entity: Entity, url: string) {
    const component = getOptionalMutableComponent(entity, ResourceProgressComponent)
    if (!component) return
    if (!component[url].value) return

    component[url].set(none)

    if (!component.keys.length) {
      removeComponent(entity, ResourceProgressComponent)
    }
  },

  getResourcesLoaded(entity: Entity) {
    const component = getOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return true

    return Object.values(component).every((resource) => resource.progress === 100)
  },

  useResourcesLoaded(entity: Entity) {
    const component = useOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return true

    return Object.values(component.get(NO_PROXY)).every((resource) => resource.progress === 100)
  },

  getResourcesProgress(entity: Entity) {
    const component = getOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return 100

    const resources = Object.values(component)
    const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
    const total = resources.length
    if (!total) return 0

    return Math.floor(progress / total)
  },

  useResourcesProgress(entity: Entity) {
    const component = useOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return 100

    const resources = Object.values(component.get(NO_PROXY))
    const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
    const total = resources.length
    if (!total) return 0

    return Math.floor(progress / total)
  },

  // Only call this in contexts where the array of entities never changes or the component calling this is remounted every time this array changes
  useResourcesProgressForEntities(entities: Entity[]) {
    const components = entities
      .map((entity) => useOptionalComponent(entity, ResourceProgressComponent))
      .filter(Boolean) as State<Record<string, { progress: number }>>[]
    if (!components.length) return 100

    const progress = components.reduce((acc, component) => {
      const resources = Object.values(component.get(NO_PROXY))
      const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
      const total = resources.length
      if (!total) return acc
      return acc + progress / total
    }, 0)
    const total = components.length
    if (!total) return 0

    return Math.floor(progress / total)
  },

  getPendingResources(entity: Entity) {
    const component = getOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return 0

    return Object.values(component).filter((resource) => resource.progress < 100).length
  },

  usePendingResources(entity: Entity) {
    const component = useOptionalComponent(entity, ResourceProgressComponent)
    if (!component) return 0

    return Object.values(component.get(NO_PROXY)).filter((resource) => resource.progress < 100).length
  },

  useAllPendingResources() {
    const query = useQuery([ResourceProgressComponent])
    return query.reduce((acc, entity) => acc + ResourceProgressComponent.getPendingResources(entity), 0)
  }
})
