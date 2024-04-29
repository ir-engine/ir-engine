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
  createEntity,
  defineComponent,
  getComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import {
  NO_PROXY,
  NO_PROXY_STEALTH,
  State,
  dispatchAction,
  getMutableState,
  useHookstate
} from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { GLTF } from '@gltf-transform/core'
import React, { useEffect } from 'react'
import { FileLoader } from '../../assets/loaders/base/FileLoader'
import {
  BINARY_EXTENSION_HEADER_MAGIC,
  EXTENSIONS,
  GLTFBinaryExtension
} from '../../assets/loaders/gltf/GLTFExtensions'
import { GLTFDocumentState, GLTFSnapshotAction } from '../GLTFDocumentState'
import { SourceComponent } from './SourceComponent'

export const GLTFComponent = defineComponent({
  name: 'GLTFComponent',

  onInit(entity) {
    return {
      src: ''
    }
  },

  onSet(entity, component, json) {
    if (typeof json?.src === 'string') component.src.set(json.src)
  },

  reactor: () => {
    const entity = useEntityContext()
    const gltfComponent = useComponent(entity, GLTFComponent)

    const [resource, progress, error] = useGLTFDocument(gltfComponent.src.value)

    console.log(gltfComponent.src.value)

    useEffect(() => {
      if (!resource) return

      /** Add snapshot only off network load */
      dispatchAction(
        GLTFSnapshotAction.createSnapshot({
          source: getComponent(entity, SourceComponent),
          data: parseStorageProviderURLs(resource)
        })
      )

      console.log(resource)
      return () => {
        console.log('cleanup')
      }
    }, [resource])

    const source = useComponent(entity, SourceComponent).value
    const gltfDocumentState = useHookstate(getMutableState(GLTFDocumentState)[source])

    const parentUUID = useComponent(entity, UUIDComponent).value

    if (!gltfDocumentState.value) return null

    return <DocumentReactor documentID={source} parentUUID={parentUUID} />
  }
})

const onError = (error: ErrorEvent) => {
  console.error(error)
}

const onProgress: (event: ProgressEvent) => void = (event) => {
  console.log(event)
}

const useGLTFDocument = (url: string) => {
  const state = useHookstate({
    document: null as GLTF.IGLTF | null,
    progress: 0,
    errorVal: null
  })

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

        const extensions = {}
        const textDecoder = new TextDecoder()
        let json: GLTF.IGLTF

        if (typeof data === 'string') {
          json = JSON.parse(data)
        } else if (data instanceof ArrayBuffer) {
          const magic = textDecoder.decode(new Uint8Array(data, 0, 4))

          if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
            try {
              /** TODO we will need to refactor and persist this */
              extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data)
            } catch (error) {
              if (onError) onError(error)
              return
            }

            json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content)
          } else {
            json = JSON.parse(textDecoder.decode(data))
          }
        } else {
          json = data
        }

        state.document.set(json)
      },
      onProgress,
      onError,
      signal
    )
    return () => {
      abortController.abort()
      state.set({
        document: null,
        progress: 0,
        errorVal: null
      })
    }
  }, [url])

  return [state.document.get(NO_PROXY), state.progress.value, state.errorVal.value] as [
    GLTF.IGLTF | null,
    number,
    ErrorEvent | null
  ]
}

const DocumentReactor = (props: { documentID: string; parentUUID: EntityUUID }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  if (!documentState.value) return null
  if (!documentState.scenes.value) return null

  const scenes = documentState.scenes.value
  const scene = scenes[documentState.scene.value!]

  return (
    <>
      {scene.nodes.map((nodeIndex) => (
        <NodeReactor
          key={nodeIndex}
          nodeIndex={nodeIndex}
          parentUUID={props.parentUUID}
          documentID={props.documentID}
        />
      ))}
    </>
  )
}

const NodeReactor = (props: { nodeIndex: number; parentUUID: EntityUUID; documentID: string }) => {
  const documentState = useHookstate(getMutableState(GLTFDocumentState)[props.documentID])
  const nodes = documentState.nodes! as State<GLTF.INode[]>

  const node = nodes[props.nodeIndex]!

  const entity = useHookstate(() => {
    const uuidExtension = node.extensions.value?.[UUIDComponent.jsonID] as EntityUUID | undefined
    const entity = createEntity()
    setComponent(entity, UUIDComponent, uuidExtension ?? UUIDComponent.generateUUID())
    return entity
  })

  const uuid = getComponent(entity.value, UUIDComponent)
  const parentEntity = UUIDComponent.getEntityByUUID(props.parentUUID)

  useEffect(() => {
    return () => {
      removeEntity(entity.value)
    }
  }, [])

  useEffect(() => {
    setComponent(entity.value, EntityTreeComponent, { parentEntity })
  }, [parentEntity])

  useEffect(() => {
    setComponent(entity.value, NameComponent, node.name.value)
  }, [node.name])

  return (
    <>
      {node.children.value?.map((childIndex) => (
        <NodeReactor key={childIndex} nodeIndex={childIndex} parentUUID={uuid} documentID={props.documentID} />
      ))}
      {node.extensions.value &&
        Object.keys(node.extensions.get(NO_PROXY)!).map((extension) => (
          <ExtensionReactor
            key={extension}
            entity={entity.value}
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
    console.log('loaded extension', props.documentID, props.nodeIndex, props.extension)
  }, [extension])

  return null
}
