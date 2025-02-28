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

import { EntityTreeComponent, getAllComponents, getComponent, serializeComponent } from '@ir-engine/ecs'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EditorState } from '../services/EditorServices'

export type EntityCopyDataType = { name: string; children: EntityCopyDataType[]; components: ComponentCopyDataType[] }
export type ComponentCopyDataType = { name: string; json: Record<string, unknown> }

// fallback to avoid error at readText
export const CopyState = defineState({
  name: 'CopyState',
  initial: ''
})

export const CopyPasteFunctions = {
  _generateEntityCopyData: (entities: Entity[]) =>
    entities
      .map((entity) => {
        const rootEntity = getState(EditorState).rootEntity
        const sourceId = getComponent(entity, SourceComponent)
        if (sourceId !== GLTFComponent.getInstanceID(rootEntity)) {
          return
        }
        const name = getComponent(entity, NameComponent)
        const children = getComponent(entity, EntityTreeComponent).children as Entity[]
        return {
          name: name,
          children: CopyPasteFunctions._generateEntityCopyData(children),
          components: CopyPasteFunctions._generateComponentCopyData(entity)
        }
      })
      .filter((e) => e !== undefined) as EntityCopyDataType[],

  _generateComponentCopyData: (entity: Entity) => {
    const components = getAllComponents(entity)
    const componentData = components
      .map((component) => {
        if (!component.jsonID) return
        const json = serializeComponent(entity, component)
        if (!json) return
        return {
          name: component.jsonID,
          json
        } as ComponentCopyDataType
      })
      .filter((c) => typeof c?.json === 'object' && c.json !== null)
      .filter((c) => c !== undefined)
    return componentData
  },

  copyEntities: async (entities: Entity[]) => {
    const copyData = JSON.stringify(CopyPasteFunctions._generateEntityCopyData(entities))
    await navigator.clipboard.writeText(copyData)
    getMutableState(CopyState).set(copyData)
  },

  getPastedEntities: async () => {
    let clipboardText = ''
    try {
      clipboardText = await navigator.clipboard.readText()
    } catch {
      clipboardText = getState(CopyState)
    }

    // eslint-disable-next-line no-useless-catch
    try {
      const nodeEntitiesData = JSON.parse(clipboardText) as EntityCopyDataType[]
      return nodeEntitiesData
    } catch (err) {
      throw err
    }
  }
}
