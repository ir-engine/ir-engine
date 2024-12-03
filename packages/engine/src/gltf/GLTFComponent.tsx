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
  generateEntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  useHasComponents,
  useOptionalComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import { parseStorageProviderURLs } from '@ir-engine/engine/src/assets/functions/parseSceneJSON'
import {
  dispatchAction,
  getMutableState,
  getState,
  NO_PROXY_STEALTH,
  none,
  State,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import {
  getAncestorWithComponents,
  useAncestorWithComponents,
  useChildrenWithComponents
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import { useGLTFResource } from '../assets/functions/resourceLoaderHooks'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import {
  BINARY_EXTENSION_CHUNK_TYPES,
  BINARY_EXTENSION_HEADER_LENGTH,
  BINARY_EXTENSION_HEADER_MAGIC
} from '../assets/loaders/gltf/GLTFExtensions'
import { ErrorComponent } from '../scene/components/ErrorComponent'
import { SourceComponent } from '../scene/components/SourceComponent'
import { addError, removeError } from '../scene/functions/ErrorFunctions'
import { SceneJsonType } from '../scene/types/SceneTypes'
import { migrateSceneJSONToGLTF } from './convertJsonToGLTF'
import { GLTFDocumentState, GLTFSnapshotAction } from './GLTFDocumentState'
import { GLTFSourceState } from './GLTFState'
import { gltfReplaceUUIDsReferences } from './gltfUtils'
import { ResourcePendingComponent } from './ResourcePendingComponent'

type DependencyEval = {
  key: string
  eval: (val: unknown) => boolean
}

type ComponentDependencies = {
  componentDependencies: Record<EntityUUID, Component[]>
  childrenDependencies: Map<Component, number>
}

const componentDependenciesLoaded = (dependencies?: ComponentDependencies) => {
  return (
    !!dependencies &&
    Object.keys(dependencies.componentDependencies).length === 0 &&
    dependencies.childrenDependencies.size === 0
  )
}

const loadDependencies = {
  ['EE_model']: [
    {
      key: 'dependencies',
      eval: (dependencies?: ComponentDependencies) => componentDependenciesLoaded(dependencies)
    }
  ]
} as Record<string, DependencyEval[]>

const buildComponentDependencies = (json: GLTF.IGLTF) => {
  const dependencies = {
    componentDependencies: {},
    childrenDependencies: new Map<Component, number>()
  } as ComponentDependencies

  const meshes = new Set<number>()
  const materials = new Set<number>()

  if (!json.nodes) return dependencies
  for (const node of json.nodes) {
    if (node.extensions && node.extensions[UUIDComponent.jsonID]) {
      const uuid = node.extensions[UUIDComponent.jsonID] as EntityUUID
      const extensions = Object.keys(node.extensions)
      for (const extension of extensions) {
        if (loadDependencies[extension]) {
          if (!dependencies.componentDependencies[uuid]) dependencies.componentDependencies[uuid] = []
          dependencies.componentDependencies[uuid].push(ComponentJSONIDMap.get(extension)!)
        }
      }
    }

    if (node.mesh !== undefined) {
      meshes.add(node.mesh)
      const mesh = json.meshes![node.mesh]
      mesh.primitives.forEach((prim) => {
        if (prim.material !== undefined) materials.add(prim.material)
      })
    }
  }

  if (meshes.size) dependencies.childrenDependencies.set(MeshComponent, meshes.size)
  if (materials.size) dependencies.childrenDependencies.set(MaterialStateComponent, materials.size)

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
    body: S.NonSerialized(S.Nullable(S.Type<ArrayBuffer>())),
    progress: S.NonSerialized(S.Number(0)),
    extensions: S.NonSerialized(S.Record(S.String(), S.Any(), {})),
    dependencies: S.NonSerialized(S.Optional(S.Type<ComponentDependencies>()))
  }),

  errors: ['LOADING_ERROR', 'INVALID_SOURCE'],

  useDependenciesLoaded(entity: Entity) {
    const dependencies = useComponent(entity, GLTFComponent).dependencies
    return componentDependenciesLoaded(dependencies.value as ComponentDependencies | undefined)
  },

  useSceneLoaded(entity: Entity) {
    const gltfComponent = useOptionalComponent(entity, GLTFComponent)
    const instanceID = GLTFComponent.useInstanceID(entity)
    const document = useMutableState(GLTFDocumentState)[instanceID].value
    if (!gltfComponent || !document) return false

    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress.value
    return componentDependenciesLoaded(dependencies.value as ComponentDependencies | undefined) && progress === 100
  },

  isSceneLoaded(entity: Entity) {
    const gltfComponent = getOptionalComponent(entity, GLTFComponent)
    if (!gltfComponent) return false

    const instanceID = GLTFComponent.getInstanceID(entity)
    const document = getState(GLTFDocumentState)[instanceID]
    if (!document) return false

    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress
    return componentDependenciesLoaded(dependencies) && progress === 100
  },

  reactor: () => {
    const entity = useEntityContext()
    const gltfComponent = useComponent(entity, GLTFComponent)

    useEffect(() => {
      const occlusion = gltfComponent.cameraOcclusion.value
      if (!occlusion) ObjectLayerMaskComponent.disableLayer(entity, ObjectLayers.Camera)
      else ObjectLayerMaskComponent.enableLayer(entity, ObjectLayers.Camera)
    }, [gltfComponent.cameraOcclusion])

    useGLTFDocument(entity)

    const sourceID = GLTFComponent.getInstanceID(entity)

    useEffect(() => {
      getMutableState(GLTFSourceState)[sourceID].set(entity)
      return () => {
        getMutableState(GLTFSourceState)[sourceID].set(none)
      }
    }, [gltfComponent.src])

    const dependencies = gltfComponent.dependencies.get(NO_PROXY_STEALTH) as ComponentDependencies | undefined
    return (
      <>
        <ResourceReactor documentID={sourceID} entity={entity} />
        {dependencies && !componentDependenciesLoaded(dependencies) ? (
          <DependencyReactor key={entity} gltfComponentEntity={entity} dependencies={dependencies} />
        ) : null}
      </>
    )
  },

  getInstanceID: (entity: Entity) => {
    const uuid = getOptionalComponent(entity, UUIDComponent)
    const src = getOptionalComponent(entity, GLTFComponent)?.src
    if (!uuid || !src) return ''
    return `${uuid}-${src}`
  },

  useInstanceID: (entity: Entity) => {
    const uuid = useOptionalComponent(entity, UUIDComponent)?.value
    const src = useOptionalComponent(entity, GLTFComponent)?.src.value
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
  const errors = ErrorComponent.useComponentErrors(entity, component)

  const removeGLTFDependency = () => {
    const gltfComponent = getMutableComponent(gltfComponentEntity, GLTFComponent)
    const uuid = getComponent(entity, UUIDComponent)
    ;(gltfComponent.dependencies as State<ComponentDependencies>).componentDependencies.set((prev) => {
      const dependencyArr = prev![uuid] as Component[]
      const index = dependencyArr.findIndex((compItem) => compItem.jsonID === component.jsonID)
      dependencyArr.splice(index, 1)
      if (!dependencyArr.length) {
        delete prev![uuid]
      }
      return prev
    })
  }

  useEffect(() => {
    const compValue = comp.value
    for (const dep of dependencies) {
      if (!dep.eval(compValue[dep.key])) return
    }

    // console.log(`All dependencies loaded for entity: ${entity} on component: ${component.jsonID}`)
    removeGLTFDependency()
  }, [...dependencies.map((dep) => comp[dep.key])])

  useEffect(() => {
    if (!errors) return
    addError(
      entity,
      GLTFComponent,
      'LOADING_ERROR',
      `GLTFComponent:ComponentReactor Component ${component.name} errored during loading`
    )
    removeGLTFDependency()
  }, [errors])

  return null
}

const DependencyEntryReactor = (props: { gltfComponentEntity: Entity; uuid: string; components: Component[] }) => {
  const { gltfComponentEntity, uuid, components } = props
  const entity = UUIDComponent.useEntityByUUID(uuid as EntityUUID) as Entity | undefined
  const hasComponents = useHasComponents(entity ?? UndefinedEntity, components)
  return entity && hasComponents ? (
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

const ChildDependencyReactor = (props: { gltfComponentEntity: Entity; component: Component; count: number }) => {
  const { gltfComponentEntity, component, count } = props
  const children = useChildrenWithComponents(gltfComponentEntity, [component])
  const childrenCount = children.length

  useEffect(() => {
    const gltfSource = GLTFComponent.getInstanceID(gltfComponentEntity)
    const gltfChildren = children.filter((child) => getOptionalComponent(child, SourceComponent) === gltfSource)
    if (gltfChildren.length === count) {
      const gltfComponent = getMutableComponent(gltfComponentEntity, GLTFComponent)
      ;(gltfComponent.dependencies as State<ComponentDependencies>).childrenDependencies.set((prev) => {
        prev.delete(component)
        return prev
      })
    }
  }, [childrenCount])

  return null
}

const DependencyReactor = (props: { gltfComponentEntity: Entity; dependencies: ComponentDependencies }) => {
  const { gltfComponentEntity, dependencies } = props
  const componentDependencies = Object.entries(dependencies.componentDependencies)
  const childrenDependencies = [...dependencies.childrenDependencies.entries()]

  useEffect(() => {
    return () => {
      const ancestor = getAncestorWithComponents(gltfComponentEntity, [SceneComponent])
      const scene = getOptionalMutableComponent(ancestor, SceneComponent)
      if (scene) scene.active.set(true)
      removeError(gltfComponentEntity, GLTFComponent, 'LOADING_ERROR')
      removeError(gltfComponentEntity, GLTFComponent, 'INVALID_SOURCE')
    }
  }, [])

  return (
    <>
      {componentDependencies.map(([uuid, components]) => {
        return (
          <DependencyEntryReactor
            key={uuid}
            gltfComponentEntity={gltfComponentEntity}
            uuid={uuid}
            components={components}
          />
        )
      })}
      {childrenDependencies.map(([component, count]) => {
        return (
          <ChildDependencyReactor
            key={component.name}
            gltfComponentEntity={gltfComponentEntity}
            component={component}
            count={count}
          />
        )
      })}
    </>
  )
}

const onProgress: (event: ProgressEvent) => void = (event) => {
  // console.log(event)
}

export const loadGLTFFile = (
  url: string,
  onLoad: (gltf: GLTF.IGLTF, body: ArrayBuffer | null) => void,
  onProgress?: (event: ProgressEvent) => void,
  onError?: (error: ErrorEvent) => void,
  signal?: AbortSignal
) => {
  const onSuccess = (data: string | ArrayBuffer | GLTF.IGLTF) => {
    if (signal && signal.aborted) return

    const textDecoder = new TextDecoder()
    let json: GLTF.IGLTF | SceneJsonType
    let body: ArrayBuffer | null = null

    if (typeof data === 'string') {
      json = JSON.parse(data)
    } else if ('byteLength' in data) {
      const magic = textDecoder.decode(new Uint8Array(data, 0, 4))

      if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
        try {
          const { json: jsonContent, body: bodyContent } = parseBinaryData(data)
          body = bodyContent
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

    onLoad(parseStorageProviderURLs(JSON.parse(JSON.stringify(json))), body)
  }

  const loader = new FileLoader()

  loader.setResponseType('arraybuffer')
  loader.setRequestHeader({})
  loader.setWithCredentials(false)

  loader.load(url, onSuccess, onProgress, onError, signal)
}

const useGLTFDocument = (entity: Entity) => {
  const state = useComponent(entity, GLTFComponent)
  const url = state.src.value
  const source = GLTFComponent.useInstanceID(entity)
  useGLTFResource(url, entity)

  useEffect(() => {
    if (!url) {
      addError(entity, GLTFComponent, 'INVALID_SOURCE', 'Invalid URL')
      return
    }

    let loaded = false

    const abortController = new AbortController()
    const signal = abortController.signal

    const onError = (error: ErrorEvent) => {
      addError(entity, GLTFComponent, 'LOADING_ERROR', 'Error loading model')
    }

    loadGLTFFile(
      url,
      (gltf, body) => {
        if (body) state.body.set(body)

        if (gltf.nodes) {
          const uuidReplacements = [] as [EntityUUID, EntityUUID][]
          for (const node of gltf.nodes) {
            if (node.extensions && node.extensions[UUIDComponent.jsonID]) {
              let uuid = node.extensions[UUIDComponent.jsonID] as EntityUUID
              //check if uuid already exists
              if (UUIDComponent.entitiesByUUIDState[uuid]?.value) {
                //regenerate uuid if it already exists
                const prevUUID = uuid
                uuid = generateEntityUUID()
                node.extensions[UUIDComponent.jsonID] = uuid
                uuidReplacements.push([prevUUID, uuid])
              }
              UUIDComponent.getOrCreateEntityByUUID(uuid)
            }
          }
          // Replace references in the GLTF of replaced uuids
          gltfReplaceUUIDsReferences(gltf, uuidReplacements)
        }

        const dependencies = buildComponentDependencies(gltf)
        state.dependencies.set(dependencies)
        loaded = true
        dispatchAction(
          GLTFSnapshotAction.createSnapshot({
            source,
            data: gltf
          })
        )
      },
      onProgress,
      onError,
      signal
    )

    return () => {
      if (loaded) dispatchAction(GLTFSnapshotAction.unload({ source }))
      abortController.abort()
      if (!hasComponent(entity, GLTFComponent)) return
      state.body.set(null)
      state.progress.set(0)
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
