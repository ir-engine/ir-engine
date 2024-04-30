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

import { parseStorageProviderURLs } from '@etherealengine/common/src/utils/parseSceneJSON'
import {
  ComponentJSONIDMap,
  Entity,
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  defineComponent,
  getComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext,
  useQuery
} from '@etherealengine/ecs'
import {
  NO_PROXY,
  NO_PROXY_STEALTH,
  State,
  dispatchAction,
  getMutableState,
  useHookstate
} from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { GLTF } from '@gltf-transform/core'
import React, { useEffect } from 'react'
import { Matrix4 } from 'three'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import { BINARY_EXTENSION_HEADER_MAGIC, EXTENSIONS, GLTFBinaryExtension } from '../assets/loaders/gltf/GLTFExtensions'
import { SceneAssetPendingTagComponent } from '../scene/components/SceneAssetPendingTagComponent'
import { SourceComponent } from '../scene/components/SourceComponent'
import { SceneJsonType } from '../scene/types/SceneTypes'
import { GLTFDocumentState, GLTFSnapshotAction } from './GLTFDocumentState'
import { migrateSceneJSONToGLTF } from './convertJsonToGLTF'

export const GLTFComponent = defineComponent({
  name: 'GLTFComponent',

  onInit(entity) {
    return {
      src: '',
      // internals
      extensions: {},
      progress: 0
    }
  },

  onSet(entity, component, json) {
    if (typeof json?.src === 'string') component.src.set(json.src)
  },

  reactor: () => {
    const entity = useEntityContext()
    const gltfComponent = useComponent(entity, GLTFComponent)

    useGLTFDocument(gltfComponent.src.value, entity)

    const source = useComponent(entity, SourceComponent).value
    const gltfDocumentState = useHookstate(getMutableState(GLTFDocumentState)[source])

    const parentUUID = useComponent(entity, UUIDComponent).value

    if (!gltfDocumentState.value) return null

    return <DocumentReactor documentID={source} parentUUID={parentUUID} />
  }
})

const onError = (error: ErrorEvent) => {
  // console.error(error)
}

const onProgress: (event: ProgressEvent) => void = (event) => {
  // console.log(event)
}

const useGLTFDocument = (url: string, entity: Entity) => {
  const state = useComponent(entity, GLTFComponent)

  useEffect(() => {
    if (!url) return

    const abortController = new AbortController()
    const signal = abortController.signal

    const loader = new FileLoader()

    loader.setResponseType('arraybuffer')
    loader.setRequestHeader({})
    loader.setWithCredentials(false)

    loader.load(
      url,
      function (data: string | ArrayBuffer | GLTF.IGLTF) {
        if (signal.aborted) return

        const textDecoder = new TextDecoder()
        let json: GLTF.IGLTF | SceneJsonType

        if (typeof data === 'string') {
          json = JSON.parse(data)
        } else if (data instanceof ArrayBuffer) {
          const magic = textDecoder.decode(new Uint8Array(data, 0, 4))

          if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
            try {
              /** TODO we will need to refactor and persist this */
              state.extensions.merge({ [EXTENSIONS.KHR_BINARY_GLTF]: new GLTFBinaryExtension(data) })
            } catch (error) {
              if (onError) onError(error)
              return
            }

            json = JSON.parse(state.extensions.value[EXTENSIONS.KHR_BINARY_GLTF].content)
          } else {
            json = JSON.parse(textDecoder.decode(data))
          }
        } else {
          json = data
        }

        /** Migrate old scene json format */
        if ('entities' in json && 'root' in json) {
          json = migrateSceneJSONToGLTF(json)
        }

        dispatchAction(
          GLTFSnapshotAction.createSnapshot({
            source: getComponent(entity, SourceComponent),
            data: parseStorageProviderURLs(json)
          })
        )
      },
      onProgress,
      onError,
      signal
    )
    return () => {
      abortController.abort()
      state.merge({
        extensions: {}
      })
    }
  }, [url])
}

const useGlTFParseProgress = (entity: Entity) => {
  const uuidComponent = useComponent(entity, UUIDComponent)
  const SelfSceneComponent = useHookstate(SceneComponent.sceneState[uuidComponent.value])
  const query = useQuery([SceneAssetPendingTagComponent, SelfSceneComponent])

  useEffect(() => {
    console.log('useGlTFParseProgress', query.length)
  }, [query])
}

const DocumentReactor = (props: { documentID: string; parentUUID: EntityUUID }) => {
  const entity = useEntityContext()
  useGlTFParseProgress(entity)

  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  if (!documentState.scenes.value) return null

  const nodes = documentState.scenes![documentState.scene.value!].nodes as State<number[]>

  const document = documentState.get(NO_PROXY)

  return (
    <>
      {nodes.get(NO_PROXY).map((nodeIndex, childIndex) => (
        <NodeReactor
          key={(document.nodes![nodeIndex].extensions![UUIDComponent.jsonID] as EntityUUID) ?? nodeIndex}
          childIndex={childIndex}
          nodeIndex={nodeIndex}
          parentUUID={props.parentUUID}
          documentID={props.documentID}
        />
      ))}
    </>
  )
}

const NodeReactor = (props: { nodeIndex: number; childIndex: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes! as State<GLTF.INode[]>

  const node = nodes[props.nodeIndex]!

  const selfEntity = useHookstate(UndefinedEntity)
  const entity = selfEntity.value

  const parentEntity = UUIDComponent.getEntityByUUID(props.parentUUID)

  useEffect(() => {
    if (!parentEntity) return

    const uuid = (node.extensions.value?.[UUIDComponent.jsonID] as EntityUUID) ?? UUIDComponent.generateUUID()
    const entity = UUIDComponent.getOrCreateEntityByUUID(uuid)

    selfEntity.set(entity)
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, SourceComponent, props.documentID)
    return () => {
      removeEntity(entity)
    }
  }, [parentEntity])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, EntityTreeComponent, { parentEntity, childIndex: props.childIndex })
  }, [entity, parentEntity])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, NameComponent, node.name.value ?? 'Node-' + props.nodeIndex)
  }, [entity, node.name])

  useEffect(() => {
    if (!entity) return

    setComponent(entity, TransformComponent)
    if (!node.matrix.value) return

    const mat4 = new Matrix4().fromArray(node.matrix.value)
    const transform = getComponent(entity, TransformComponent)
    mat4.decompose(transform.position, transform.rotation, transform.scale)
  }, [entity, node.matrix.value])

  if (!entity) return null

  const uuid = getComponent(entity, UUIDComponent)

  return (
    <>
      {/* {node.mesh.value && (
        <MeshReactor nodeIndex={props.nodeIndex} documentID={props.documentID} entity={entity} />
      )} */}
      {node.children.value?.map((nodeIndex, childIndex) => (
        <NodeReactor
          key={nodeIndex}
          nodeIndex={nodeIndex}
          childIndex={childIndex}
          parentUUID={uuid}
          documentID={props.documentID}
        />
      ))}
      {node.extensions.value &&
        Object.keys(node.extensions.get(NO_PROXY)!).map((extension) => (
          <ExtensionReactor
            key={extension}
            entity={entity}
            extension={extension}
            nodeIndex={props.nodeIndex}
            documentID={props.documentID}
          />
        ))}
    </>
  )
}

const ExtensionReactor = (props: { entity: Entity; extension: string; nodeIndex: number; documentID: string }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes! as State<GLTF.INode[]>
  const node = nodes[props.nodeIndex]!

  const extension = node.extensions![props.extension]

  useEffect(() => {
    const Component = ComponentJSONIDMap.get(props.extension)
    if (!Component) return console.warn('no component found for extension', props.extension)
    setComponent(props.entity, Component, extension.get(NO_PROXY_STEALTH))
  }, [extension])

  return null
}

// const MeshReactor = (props: { nodeIndex: number; documentID: string; entity: Entity }) => {
//   const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
//   const nodes = documentState.nodes! as State<GLTF.INode[]>
//   const node = nodes[props.nodeIndex]!

//   const mesh = documentState.meshes![node.mesh.value!] as State<GLTF.IMesh>

//   return (
//     <>
//       {mesh.primitives.value.map((primitive, index) => (
//         <PrimitiveReactor
//           key={index}
//           primitiveIndex={index}
//           nodeIndex={props.nodeIndex}
//           documentID={props.documentID}
//           entity={props.entity}
//         />
//       ))}
//     </>
//   )
// }

// const PrimitiveReactor = (props: { primitiveIndex: number; nodeIndex: number; documentID: string; entity: Entity }) => {
//   const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
//   const nodes = documentState.nodes! as State<GLTF.INode[]>
//   const node = nodes[props.nodeIndex]!

//   const primitive = documentState.meshes![node.mesh.value!].primitives[props.primitiveIndex]

//   useEffect(() => {
//     /** TODO implement all mesh types */
//   }, [primitive])

//   return null
// }

/**
 * TODO figure out how to support extensions that change the behaviour of these reactors
 * - we pretty much have to add a new API for each dependency type, like how the GLTFLoader does
 */
