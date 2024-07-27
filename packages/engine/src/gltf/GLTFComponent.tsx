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

import { GLTF } from '@gltf-transform/core'
import React, { useEffect } from 'react'

import { parseStorageProviderURLs } from '@etherealengine/common/src/utils/parseSceneJSON'
import {
  defineComponent,
  Entity,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  useComponent,
  useEntityContext,
  useQuery
} from '@etherealengine/ecs'
import { dispatchAction, getState, useHookstate, useMutableState } from '@etherealengine/hyperflux'

import { FileLoader } from '../assets/loaders/base/FileLoader'
import {
  BINARY_EXTENSION_CHUNK_TYPES,
  BINARY_EXTENSION_HEADER_LENGTH,
  BINARY_EXTENSION_HEADER_MAGIC
} from '../assets/loaders/gltf/GLTFExtensions'
import { SourceComponent } from '../scene/components/SourceComponent'
import { SceneJsonType } from '../scene/types/SceneTypes'
import { migrateSceneJSONToGLTF } from './convertJsonToGLTF'
import { GLTFDocumentState, GLTFSnapshotAction } from './GLTFDocumentState'
import { ResourcePendingComponent } from './ResourcePendingComponent'

export const GLTFComponent = defineComponent({
  name: 'GLTFComponent',

  onInit(entity) {
    return {
      src: '',
      // internals
      body: null as null | ArrayBuffer,
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

    const documentID = useComponent(entity, SourceComponent).value

    return <ResourceReactor documentID={documentID} entity={entity} />
  }
})

const ResourceReactor = (props: { documentID: string; entity: Entity }) => {
  const resourceQuery = useQuery([SourceComponent, ResourcePendingComponent])
  const gltfDocumentState = useMutableState(GLTFDocumentState)
  const sourceEntities = useHookstate(SourceComponent.entitiesBySourceState[props.documentID])

  useEffect(() => {
    if (getComponent(props.entity, GLTFComponent).progress === 100) return
    if (!getState(GLTFDocumentState)[props.documentID]) return

    const entities = resourceQuery.filter((e) => getComponent(e, SourceComponent) === props.documentID)
    if (!entities.length) {
      getMutableComponent(props.entity, GLTFComponent).progress.set(100)
      return
    }

    const resources = entities
      .map((entity) => {
        const resource = getOptionalComponent(entity, ResourcePendingComponent)
        if (!resource) return []
        return Object.values(resource).map((resource) => {
          return {
            progress: resource.progress,
            total: resource.total
          }
        })
      })
      .flat()
      .filter(Boolean)

    const progress = resources.reduce((acc, resource) => acc + resource.progress, 0)
    const total = resources.reduce((acc, resource) => acc + resource.total, 0)

    const percentage = total === 0 ? 100 : (progress / total) * 100
    getMutableComponent(props.entity, GLTFComponent).progress.set(percentage)
  }, [resourceQuery, sourceEntities, gltfDocumentState[props.documentID]])

  return null
}

const onError = (error: ErrorEvent) => {
  // console.error(error)
}

const onProgress: (event: ProgressEvent) => void = (event) => {
  // console.log(event)
}

const useGLTFDocument = (url: string, entity: Entity) => {
  const state = useComponent(entity, GLTFComponent)
  const sourceComponent = useComponent(entity, SourceComponent)

  useEffect(() => {
    const source = sourceComponent.value
    return () => {
      dispatchAction(GLTFSnapshotAction.unload({ source }))
    }
  }, [])

  useEffect(() => {
    if (!url) return

    const abortController = new AbortController()
    const signal = abortController.signal

    const onSuccess = (data: string | ArrayBuffer | GLTF.IGLTF) => {
      if (signal.aborted) return

      const textDecoder = new TextDecoder()
      let json: GLTF.IGLTF | SceneJsonType

      if (typeof data === 'string') {
        json = JSON.parse(data)
      } else if (data instanceof ArrayBuffer) {
        const magic = textDecoder.decode(new Uint8Array(data, 0, 4))

        if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
          try {
            const { json: jsonContent, body } = parseBinaryData(data)
            state.body.set(body)
            json = jsonContent
          } catch (error) {
            if (onError) onError(error)
            return
          }
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
          data: parseStorageProviderURLs(JSON.parse(JSON.stringify(json)))
        })
      )
    }

    const loader = new FileLoader()

    loader.setResponseType('arraybuffer')
    loader.setRequestHeader({})
    loader.setWithCredentials(false)

    loader.load(url, onSuccess, onProgress, onError, signal)

    return () => {
      abortController.abort()
      if (!hasComponent(entity, GLTFComponent)) return
      state.body.set(null)
    }
  }, [url])
}

export const parseBinaryData = (data) => {
  const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH)
  const textDecoder = new TextDecoder()

  const header = {
    magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
    version: headerView.getUint32(4, true),
    length: headerView.getUint32(8, true)
  }

  if (header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
    throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.')
  } else if (header.version < 2.0) {
    throw new Error('THREE.GLTFLoader: Legacy binary file detected.')
  }

  const chunkContentsLength = header.length - BINARY_EXTENSION_HEADER_LENGTH
  const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH)
  let chunkIndex = 0

  let content = null as string | null
  let body = null as ArrayBuffer | null

  while (chunkIndex < chunkContentsLength) {
    const chunkLength = chunkView.getUint32(chunkIndex, true)
    chunkIndex += 4

    const chunkType = chunkView.getUint32(chunkIndex, true)
    chunkIndex += 4

    if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
      const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength)
      content = textDecoder.decode(contentArray)
    } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
      const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex
      body = data.slice(byteOffset, byteOffset + chunkLength)
    }

    // Clients must ignore chunks with unknown types.

    chunkIndex += chunkLength
  }

  if (content === null) {
    throw new Error('THREE.GLTFLoader: JSON content not found.')
  }

  return { json: JSON.parse(content), body }
}
