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

import { GLTF } from '@gltf-transform/core'
import { Component, Entity, EntityID, EntityUUID, SerializedComponentType } from '@ir-engine/ecs'
import { Patch } from 'rfc6902'
import { OVERRIDE_EXTENSION_NAME } from './overrideExporterExtension'

const SCENE_DELTA_EXTENSION_NAME = 'IR_scene_delta'
const MATERIAL_JSON_ID = 'materialParameters' as const

export type SceneDeltaRegistry = Record<EntityUUID, SceneDeltaEntry<any>>
export type SceneDeltaEntry<C extends Component> = Record<EntityID, Record<string, Partial<SerializedComponentType<C>>>>
export type MaterialDeltaEntry = Record<typeof MATERIAL_JSON_ID, any>

export const migrateSceneDeltas = (entity: Entity, gltf: GLTF.IGLTF) => {
  if (!gltf.extensions) return
  const deltas = gltf.extensions?.[SCENE_DELTA_EXTENSION_NAME] as SceneDeltaRegistry
  if (deltas) {
    // migrate to override data format
    const overrideData = {} as Record<EntityUUID, Patch>
    for (const [uuid, nodeDeltas] of Object.entries(deltas)) {
      overrideData[uuid] = []
      for (const [nodeID, componentDeltas] of Object.entries(nodeDeltas)) {
        for (const [componentID, delta] of Object.entries(componentDeltas)) {
          if (Object.keys(delta).length === 0) {
            overrideData[uuid].push({
              op: 'add',
              path: `/${nodeID}/${componentID}`,
              value: {}
            })
            continue
          }
          for (const [key, value] of Object.entries(delta)) {
            overrideData[uuid].push({
              op: 'replace', // we want either replace or add here, but it might throw in either case
              path: `/${nodeID}/${componentID}/${key}`,
              value: value
            })
          }
        }
      }
    }
    gltf.extensions[OVERRIDE_EXTENSION_NAME] = overrideData
    delete gltf.extensions[SCENE_DELTA_EXTENSION_NAME]
  }
}
