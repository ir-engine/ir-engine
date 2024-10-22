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

import { GLTF } from '@gltf-transform/core'

import { ComponentJSONIDMap } from '@ir-engine/ecs/src/ComponentFunctions'

import { UUIDComponent, generateEntityUUID } from '@ir-engine/ecs'
import { ComponentJsonType } from '../../../../scene/types/SceneTypes'
import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export type EE_ecs = {
  data: [string, any][]
}

export default class EEECSImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_ecs'

  beforeRoot() {
    const parser = this.parser
    const json: GLTF.IGLTF = parser.json
    const useVisible = !!json.extensionsUsed?.includes(this.name) || !!json.extensionsUsed?.includes('EE_visible')
    const nodeCount = json.nodes?.length || 0

    const remappedUUIDs: Record<string, string> = {}

    for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
      const nodeDef = json.nodes![nodeIndex]

      if (useVisible) {
        nodeDef.extras ??= {}
        nodeDef.extras.useVisible = true
      }

      // CURRENT ECS EXTENSION FORMAT //
      const ecsExtensions: Record<string, any> = nodeDef.extensions ?? {}
      const componentJson: ComponentJsonType[] = []
      for (const jsonID of Object.keys(ecsExtensions)) {
        const component = ComponentJSONIDMap.get(jsonID)
        if (!component) {
          continue
        }
        //@todo: comprehensive solution to loading the same file multiple times
        if (component === UUIDComponent) {
          const uuid = ecsExtensions[jsonID]
          //check if uuid already exists
          if (UUIDComponent.entitiesByUUIDState[uuid]?.value) {
            //regenerate uuid if it already exists
            const newUUID = generateEntityUUID()
            ecsExtensions[jsonID] = newUUID
            remappedUUIDs[uuid] = newUUID
          }
        }
        const compData = ecsExtensions[jsonID]
        componentJson.push({
          name: jsonID,
          props: compData
        })
      }
      if (componentJson.length > 0) {
        nodeDef.extras ??= {}
        nodeDef.extras.componentJson = componentJson
      }
      // - //

      // LEGACY ECS EXTENSION FORMAT //
      if (!nodeDef.extensions?.[this.name]) continue
      const extensionDef: EE_ecs = nodeDef.extensions[this.name] as any
      const containsECSData = !!extensionDef.data && extensionDef.data.some(([k]) => k.startsWith('xrengine.'))
      if (!containsECSData) continue
      nodeDef.extras ??= {}
      nodeDef.extras.ecsData = extensionDef.data
      // - //
    }

    // apply UUID remaps to any references to UUIDs in component json
    for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
      const nodeDef = json.nodes![nodeIndex]
      const ecsData = nodeDef.extras?.ecsData as any
      const componentJson = nodeDef.extras?.componentJson as any
      if (!ecsData && !componentJson) continue
      const frontier: object[] = [componentJson, ecsData]
      while (frontier.length > 0) {
        const data = frontier.pop()
        for (const key in data) {
          const value = data[key]
          if (typeof value === 'object') {
            frontier.push(value)
          } else if (typeof value === 'string' && remappedUUIDs[value]) {
            data[key] = remappedUUIDs[value]
          }
        }
      }
    }

    return null
  }
}
