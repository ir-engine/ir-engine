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

import { EntityUUID } from '@etherealengine/ecs'
import { defineAction, defineState } from '@etherealengine/hyperflux'
import { NodeIDComponent } from '@etherealengine/spatial/src/transform/components/NodeIDComponent'
import { SourceID } from '@etherealengine/spatial/src/transform/components/SourceComponent'
import { GLTF } from '@gltf-transform/core'
import matches, { Validator } from 'ts-matches'

export const GLTFDocumentState = defineState({
  name: 'ee.engine.gltf.GLTFDocumentState',
  initial: {} as Record<string, GLTF.IGLTF>
})

export const GLTFNodeState = defineState({
  name: 'ee.engine.gltf.GLTFNodeState',
  initial: {} as Record<
    SourceID,
    Record<
      string,
      {
        nodeIndex: number
        childIndex: number
        parentUUID: EntityUUID
      }
    >
  >,

  convertGltfToNodeDictionary: (rootUUID: EntityUUID, gltf: GLTF.IGLTF) => {
    const nodes: Record<SourceID, { nodeIndex: number; childIndex: number; parentUUID: EntityUUID }> = {}

    const addNode = (nodeIndex: number, childIndex: number, parentUUID: EntityUUID) => {
      const node = gltf.nodes![nodeIndex]
      const uuid = `${rootUUID}-${node.extensions?.[NodeIDComponent.jsonID]}` as any as EntityUUID
      if (uuid) {
        nodes[uuid] = { nodeIndex, childIndex, parentUUID }
      } else {
        /** @todo generate a globally deterministic UUID here */
        console.warn('Node does not have a UUID:', node)
        return
      }
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          addNode(node.children[i], i, uuid)
        }
      }
    }

    const scene = gltf.scenes![0]
    for (let i = 0; i < scene.nodes!.length; i++) {
      const index = scene.nodes[i]
      addNode(index, i, rootUUID)
    }
    return nodes
  }
})

export const GLTFModifiedState = defineState({
  name: 'ee.engine.gltf.GLTFModifiedState',
  initial: {} as Record<string, boolean>
})

export class GLTFSnapshotAction {
  static createSnapshot = defineAction({
    type: 'ee.gltf.snapshot.CREATE_SNAPSHOT' as const,
    source: matches.string as Validator<unknown, string>,
    data: matches.object as Validator<unknown, GLTF.IGLTF>
  })

  static undo = defineAction({
    type: 'ee.gltf.snapshot.UNDO' as const,
    source: matches.string as Validator<unknown, string>,
    count: matches.number
  })

  static redo = defineAction({
    type: 'ee.gltf.snapshot.REDO' as const,
    source: matches.string as Validator<unknown, string>,
    count: matches.number
  })

  static clearHistory = defineAction({
    type: 'ee.gltf.snapshot.CLEAR_HISTORY' as const,
    source: matches.string as Validator<unknown, string>
  })

  static unload = defineAction({
    type: 'ee.gltf.snapshot.UNLOAD' as const,
    source: matches.string as Validator<unknown, string>
  })
}
