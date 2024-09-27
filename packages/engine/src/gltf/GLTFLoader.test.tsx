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
import {
  createEntity,
  Entity,
  EntityContext,
  generateEntityUUID,
  setComponent,
  useEntityContext,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { applyIncomingActions, NO_PROXY, startReactor, useDidMount, useMutableState } from '@ir-engine/hyperflux'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import assert from 'assert'
import React, { useEffect } from 'react'
import { GLTFComponent } from './GLTFComponent'
import { GLTFDocumentState, GLTFNode, GLTFNodeState } from './GLTFDocumentState'
import { getNodeUUID } from './GLTFState'

const CDN_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0'
const duck_gltf = CDN_URL + '/Duck/glTF/Duck.gltf'

describe('GLTF Loader', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('can load a mesh', (done) => {
    const entity = createEntity()

    const MeshReactor = (props: { entity: Entity; nodeIndex: number }) => {
      const { entity, nodeIndex } = props
      const meshComponent = useOptionalComponent(entity, MeshComponent)

      useDidMount(() => {
        assert(meshComponent)
        assert(meshComponent.name.value === 'Node-' + nodeIndex)
        assert(meshComponent.entity.value === entity)
        done()
      }, [meshComponent])

      return null
    }

    const NodeReactor = (props: { source: string; node: GLTFNode; gltf: GLTF.IGLTF }) => {
      const { source, node, gltf } = props
      const nodeIndex = node.nodeIndex
      const documentNode = gltf.nodes![nodeIndex]
      const nodeUUID = getNodeUUID(documentNode, source, nodeIndex)
      const entity = UUIDComponent.useEntityByUUID(nodeUUID)

      return entity && typeof documentNode.mesh === 'number' ? (
        <MeshReactor entity={entity} nodeIndex={nodeIndex} />
      ) : null
    }

    const root = startReactor(() => {
      return React.createElement(
        EntityContext.Provider,
        { value: entity },
        React.createElement(() => {
          const entity = useEntityContext()
          const gltfComponent = useOptionalComponent(entity, GLTFComponent)
          const instanceID = GLTFComponent.useInstanceID(entity)
          const gltfDocumentState = useMutableState(GLTFDocumentState)
          const nodeState = useMutableState(GLTFNodeState)
          const gltf = gltfDocumentState[instanceID].get(NO_PROXY)
          const nodes = nodeState[instanceID].get(NO_PROXY)

          useEffect(() => {
            setComponent(entity, UUIDComponent, generateEntityUUID())
            setComponent(entity, GLTFComponent, { src: duck_gltf })
          }, [])

          useEffect(() => {
            if (!gltfComponent || !gltfComponent.dependencies.value) return
            const deps = gltfComponent.dependencies.get(NO_PROXY)
            applyIncomingActions()
          }, [gltfComponent?.dependencies])

          return nodes ? (
            <>
              {Object.entries(nodes).map(([source, node], index) => {
                return <NodeReactor key={index} source={instanceID} node={node} gltf={gltf as GLTF.IGLTF} />
              })}
            </>
          ) : null
        }, {})
      )
    })
  })
})
