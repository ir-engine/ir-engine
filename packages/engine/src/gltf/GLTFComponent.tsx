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
import React, { useEffect } from 'react'

import {
  Component,
  ComponentJSONIDMap,
  defineComponent,
  Entity,
  EntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import { parseStorageProviderURLs } from '@ir-engine/engine/src/assets/functions/parseSceneJSON'
import { dispatchAction, getMutableState, getState, none, useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { useAncestorWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { useGLTFResource } from '../assets/functions/resourceLoaderHooks'
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
import { GLTFSourceState } from './GLTFState'
import { ResourcePendingComponent } from './ResourcePendingComponent'

const loadDependencies = {
  ['EE_model']: ['body']
} as Record<string, string[]>

type ComponentDependencies = Record<EntityUUID, Component[]>

const buildComponentDependencies = (json: GLTF.IGLTF) => {
  const dependencies = {} as ComponentDependencies
  if (!json.nodes) return dependencies
  for (const node of json.nodes) {
    if (!node.extensions || !node.extensions[UUIDComponent.jsonID]) continue
    const uuid = node.extensions[UUIDComponent.jsonID] as EntityUUID
    const extensions = Object.keys(node.extensions)
    for (const extension of extensions) {
      if (loadDependencies[extension]) {
        if (!dependencies[uuid]) dependencies[uuid] = []
        dependencies[uuid].push(ComponentJSONIDMap.get(extension)!)
      }
    }
  }

  return dependencies
}

export const GLTFComponent = defineComponent({
  name: 'GLTFComponent',
  jsonID: 'EE_model',

  schema: S.Object({
    src: S.String(''),
    /** @todo move this to it's own component */
    cameraOcclusion: S.Bool(false),

    // internals
    body: S.Nullable(S.Type<ArrayBuffer>()),
    progress: S.Number(0),
    extensions: S.Record(S.String(), S.Any(), {}),
    dependencies: S.Optional(S.Type<ComponentDependencies>())
  }),

  onSet(entity, component, json) {
    if (typeof json?.src === 'string') component.src.set(json.src)
    if (typeof json?.cameraOcclusion === 'boolean') component.cameraOcclusion.set(json.cameraOcclusion)
  },

  useDependenciesLoaded(entity: Entity) {
    const dependencies = useComponent(entity, GLTFComponent).dependencies
    return !!(dependencies.value && !dependencies.keys?.length)
  },

  useSceneLoaded(entity: Entity) {
    const gltfComponent = useComponent(entity, GLTFComponent)
    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress.value
    return !!(dependencies.value && !dependencies.keys?.length) && progress === 100
  },

  isSceneLoaded(entity: Entity) {
    const gltfComponent = getComponent(entity, GLTFComponent)
    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress
    return !!(dependencies && !Object.keys(dependencies).length) && progress === 100
  },

  reactor: () => {
    const entity = useEntityContext()
    const gltfComponent = useComponent(entity, GLTFComponent)
    const dependencies = gltfComponent.dependencies

    useEffect(() => {
      const occlusion = gltfComponent.cameraOcclusion.value
      if (!occlusion) ObjectLayerMaskComponent.disableLayer(entity, ObjectLayers.Camera)
      else ObjectLayerMaskComponent.enableLayer(entity, ObjectLayers.Camera)
    }, [gltfComponent.cameraOcclusion])

    useGLTFDocument(gltfComponent.src.value, entity)

    const sourceID = GLTFComponent.getInstanceID(entity)

    useEffect(() => {
      getMutableState(GLTFSourceState)[sourceID].set(entity)
      return () => {
        getMutableState(GLTFSourceState)[sourceID].set(none)
      }
    }, [])

    return (
      <>
        <ResourceReactor documentID={sourceID} entity={entity} />
        {dependencies.value && dependencies.keys?.length ? (
          <DependencyReactor
            key={entity}
            gltfComponentEntity={entity}
            dependencies={dependencies.value as ComponentDependencies}
          />
        ) : null}
      </>
    )
  },

  getInstanceID: (entity) => {
    return `${getComponent(entity, UUIDComponent)}-${getComponent(entity, GLTFComponent).src}`
  },

  useInstanceID: (entity) => {
    const uuid = useComponent(entity, UUIDComponent)?.value
    const src = useComponent(entity, GLTFComponent)?.src.value
    if (!uuid || !src) return ''
    return `${uuid}-${src}`
  }
})

const ResourceReactor = (props: { documentID: string; entity: Entity }) => {
  const dependenciesLoaded = GLTFComponent.useDependenciesLoaded(props.entity)
  const resourceQuery = useQuery([SourceComponent, ResourcePendingComponent])
  const gltfDocumentState = useMutableState(GLTFDocumentState)
  const sourceEntities = useHookstate(SourceComponent.entitiesBySourceState[props.documentID])

  useEffect(() => {
    if (getComponent(props.entity, GLTFComponent).progress === 100) return
    if (!getState(GLTFDocumentState)[props.documentID]) return
    const entities = resourceQuery.filter((e) => getComponent(e, SourceComponent) === props.documentID)
    if (!entities.length) {
      if (dependenciesLoaded) getMutableComponent(props.entity, GLTFComponent).progress.set(100)
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
    if (!total) return

    const percentage = Math.floor(Math.min((progress / total) * 100, dependenciesLoaded ? 100 : 99))
    getMutableComponent(props.entity, GLTFComponent).progress.set(percentage)
  }, [resourceQuery, sourceEntities, gltfDocumentState[props.documentID], dependenciesLoaded])

  return null
}

const ComponentReactor = (props: { gltfComponentEntity: Entity; entity: Entity; component: Component }) => {
  const { gltfComponentEntity, entity, component } = props
  const dependencies = loadDependencies[component.jsonID!]
  const comp = useComponent(entity, component)

  useEffect(() => {
    const compValue = comp.value
    for (const key of dependencies) {
      if (!compValue[key]) return
    }

    // All dependencies loaded, remove from dependency array
    const gltfComponent = getMutableComponent(gltfComponentEntity, GLTFComponent)
    const uuid = getComponent(entity, UUIDComponent)
    gltfComponent.dependencies.set((prev) => {
      const dependencyArr = prev![uuid] as Component[]
      const index = dependencyArr.findIndex((compItem) => compItem.jsonID === component.jsonID)
      dependencyArr.splice(index, 1)
      if (!dependencyArr.length) {
        delete prev![uuid]
      }
      return prev
    })
  }, [...dependencies.map((key) => comp[key])])

  return null
}

const DependencyEntryReactor = (props: { gltfComponentEntity: Entity; uuid: string; components: Component[] }) => {
  const { gltfComponentEntity, uuid, components } = props
  const entity = UUIDComponent.useEntityByUUID(uuid as EntityUUID) as Entity | undefined
  return entity ? (
    <>
      {components.map((component) => {
        return (
          <ComponentReactor
            key={component.jsonID}
            gltfComponentEntity={gltfComponentEntity}
            entity={entity}
            component={component}
          />
        )
      })}
    </>
  ) : null
}

const DependencyReactor = (props: { gltfComponentEntity: Entity; dependencies: ComponentDependencies }) => {
  const { gltfComponentEntity, dependencies } = props
  const entries = Object.entries(dependencies)

  console.log(props.dependencies)

  return (
    <>
      {entries.map(([uuid, components]) => {
        return (
          <DependencyEntryReactor
            key={uuid}
            gltfComponentEntity={gltfComponentEntity}
            uuid={uuid}
            components={components}
          />
        )
      })}
    </>
  )
}

const onError = (error: ErrorEvent) => {
  // console.error(error)
}

const onProgress: (event: ProgressEvent) => void = (event) => {
  // console.log(event)
}

const useGLTFDocument = (url: string, entity: Entity) => {
  const state = useComponent(entity, GLTFComponent)
  const source = GLTFComponent.getInstanceID(entity)
  useGLTFResource(url, entity)

  useEffect(() => {
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

      const dependencies = buildComponentDependencies(json)
      state.dependencies.set(dependencies)

      dispatchAction(
        GLTFSnapshotAction.createSnapshot({
          source,
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

/**
 * Returns true if the entity is part of a model or a mesh component that is not a child of model
 * @param entity
 * @returns {boolean}
 */
export const useHasModelOrIndependentMesh = (entity: Entity) => {
  const hasModel = !!useOptionalComponent(entity, GLTFComponent)
  const isChildOfModel = !!useAncestorWithComponents(entity, [GLTFComponent, SceneComponent])
  const hasMesh = !!useOptionalComponent(entity, MeshComponent)
  return hasModel || (hasMesh && !isChildOfModel)
}
