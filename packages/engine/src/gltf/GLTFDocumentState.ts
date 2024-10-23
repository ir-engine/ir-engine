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
import matches, { Validator } from 'ts-matches'

import { Entity, EntityUUID, UUIDComponent, getComponent, useOptionalComponent } from '@ir-engine/ecs'
import {
  HyperFlux,
  State,
  defineAction,
  defineState,
  getMutableState,
  getState,
  useHookstate
} from '@ir-engine/hyperflux'
import { SourceComponent } from '../scene/components/SourceComponent'

export const GLTFDocumentState = defineState({
  name: 'ee.engine.gltf.GLTFDocumentState',
  initial: {} as Record<string, GLTF.IGLTF>
})

export type GLTFNode = {
  nodeIndex: number
  childIndex: number
  parentUUID: EntityUUID | null // store parent, if no parent, then it is a root node
}

export const GLTFNodeState = defineState({
  name: 'ee.engine.gltf.GLTFNodeState',
  initial: {} as Record<string, Record<string, GLTFNode>>,

  getMutableNode(entity: Entity): State<GLTF.INode> {
    const source = getComponent(entity, SourceComponent)
    const uuid = getComponent(entity, UUIDComponent)
    if (!source || !uuid) {
      HyperFlux.store
        .logger('GLTFNodeState.getMutableNode')
        .error('entity does not have SourceComponent or UUIDComponent')
    }
    const nodeLookup = getState(GLTFNodeState)[source][uuid]
    if (!nodeLookup) {
      HyperFlux.store.logger('GLTFNodeState.getMutableNode').error('node not found in lookup')
    }
    const gltf = getMutableState(GLTFDocumentState)[source]
    return gltf.nodes![nodeLookup.nodeIndex]
  },

  useMutableNode(entity: Entity): GLTF.INode | undefined {
    try {
      const nodeState = useHookstate(getMutableState(GLTFNodeState))
      const source = useOptionalComponent(entity, SourceComponent)?.value
      const uuid = useOptionalComponent(entity, UUIDComponent)?.value

      if (!source || !uuid) {
        console.warn('useMutableNode: Missing source or UUID for entity', entity)
        return undefined
      }

      const sourceNodes = nodeState.value[source]
      if (!sourceNodes) {
        console.warn(`useMutableNode: No nodes found for source "${source}"`)
        return undefined
      }

      const nodeLookup = sourceNodes[uuid]
      if (!nodeLookup) {
        console.warn(`useMutableNode: No node lookup found for UUID "${uuid}"`)
        return undefined
      }

      const gltfDocument = getState(GLTFDocumentState)[source]
      if (!gltfDocument || !gltfDocument.nodes) {
        console.warn(`useMutableNode: No GLTF document or nodes found for source "${source}"`)
        return undefined
      }

      return gltfDocument.nodes[nodeLookup.nodeIndex]
    } catch (error) {
      console.error('Error in useMutableNode:', error)
      return undefined
    }
  },

  convertGltfToNodeDictionary: (gltf: GLTF.IGLTF, source: string) => {
    const nodes: Record<string, { nodeIndex: number; childIndex: number; parentUUID: EntityUUID | null }> = {}

    const addNode = (nodeIndex: number, childIndex: number, parentUUID: EntityUUID | null) => {
      const node = gltf.nodes![nodeIndex]
      const uuid = (node.extensions?.[UUIDComponent.jsonID] as any as EntityUUID) ?? source + '-' + nodeIndex
      if (uuid) {
        nodes[uuid] = { nodeIndex, childIndex, parentUUID }
      } else {
        /** @todo generate a globally deterministic UUID here */
        // console.warn('Node does not have a UUID:', node)
        // return
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
      addNode(index, i, null)
    }

    for (let i = 0; i < gltf.scenes![0].nodes!.length; i++) {
      const nodeIndex = gltf.scenes![0].nodes![i]
      const node = gltf.nodes![nodeIndex]
      const uuid = (node.extensions?.[UUIDComponent.jsonID] as any as EntityUUID) ?? source + '-' + nodeIndex
      if (uuid) {
        nodes[uuid] = {
          nodeIndex,
          childIndex: i,
          parentUUID: null
        }
      } else {
        console.warn('Node does not have a UUID:', node)
      }
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
