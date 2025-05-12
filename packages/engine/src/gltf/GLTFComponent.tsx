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
import React, { Suspense, useEffect } from 'react'

import {
  Component,
  ComponentJSONIDMap,
  defineComponent,
  Entity,
  EntityID,
  EntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getSimulationCounterpart,
  hasComponent,
  LayerID,
  Layers,
  removeComponent,
  removeEntity,
  setComponent,
  SourceID,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  useHasComponent,
  useHasComponents,
  useOptionalComponent,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import { parseStorageProviderURLs } from '@ir-engine/engine/src/assets/functions/parseSceneJSON'
import { getMutableState, getState, NO_PROXY_STEALTH, none, State, useHookstate } from '@ir-engine/hyperflux'

import { LayerComponent, useAncestorWithComponents } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { TransformComponent } from '@ir-engine/spatial'
import { ShapeSchema } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { LoaderUtils } from 'three'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { ErrorComponent } from '../scene/components/ErrorComponent'
import { SceneDynamicLoadComponent } from '../scene/components/SceneDynamicLoadComponent'
import { addError, removeError } from '../scene/functions/ErrorFunctions'
import { SceneJsonType } from '../scene/types/SceneTypes'
import { GLTFLoaderFunctions, GLTFParserOptions } from './GLTFLoaderFunctions'
import { AssetState } from './GLTFState'
import { ResourcePendingComponent } from './ResourcePendingComponent'
import { useApplyCollidersToChildMeshesEffect } from './useApplyCollidersToChildMeshesEffect'

export const GLTFComponent = defineComponent({
  name: 'GLTFComponent',
  jsonID: 'EE_model',

  schema: S.Object({
    src: S.String({ default: '' }),

    /** @todo move this to it's own component */
    cameraOcclusion: S.Bool({ default: true }),

    //collision info
    applyColliders: S.Bool(),
    shape: ShapeSchema('box'),

    // internals
    body: S.Type<ArrayBuffer | null>({ serialized: false }),
    document: S.Type<GLTF.IGLTF | null>({ serialized: false }),
    progress: S.Number({ default: 0, serialized: false }),
    extensions: S.Record(S.String(), S.Any(), { serialized: false }),
    dependencies: S.Type<ComponentDependencies | undefined>({ serialized: false })
  }),

  errors: ['LOADING_ERROR', 'INVALID_SOURCE'],

  useDependenciesLoaded(entity: Entity) {
    const dependencies = useComponent(entity, GLTFComponent).dependencies
    return componentDependenciesLoaded(dependencies.value as ComponentDependencies | undefined)
  },

  useSceneLoaded(entity: Entity) {
    const gltfComponent = useOptionalComponent(entity, GLTFComponent)
    if (!gltfComponent) return false
    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress.value
    return componentDependenciesLoaded(dependencies.value as ComponentDependencies | undefined) && progress === 100
  },

  isSceneLoaded(entity: Entity) {
    const gltfComponent = getOptionalComponent(entity, GLTFComponent)
    if (!gltfComponent) return false
    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress
    return componentDependenciesLoaded(dependencies) && progress === 100
  },

  getEntityBySourceAndID(source: Entity, id: EntityID, layer = Layers.Simulation as LayerID) {
    return UUIDComponent.getEntityByUUID(
      ((GLTFComponent.getSourceID(source) || UUIDComponent.get(source)) + id) as EntityUUID,
      layer
    )
  },

  getSourceID: (entity: Entity): SourceID =>
    hasComponent(entity, UUIDComponent)
      ? hasComponent(entity, GLTFComponent)
        ? UUIDComponent.getAsSourceID(entity)
        : getComponent(entity, UUIDComponent).entitySourceID
      : ('' as SourceID),

  useSourceID: (entity: Entity): SourceID => {
    const uuid = useOptionalComponent(entity, UUIDComponent)?.value
    if (!uuid) return '' as SourceID
    if (hasComponent(entity, GLTFComponent)) return UUIDComponent.getAsSourceID(entity)
    return uuid?.entitySourceID || ('' as SourceID)
  }
})

type DependencyEval = {
  key: string
  eval: (val: unknown) => boolean
}

type ComponentDependencies = {
  componentDependencies: Record<EntityUUID, Component[]>
}

const componentDependenciesLoaded = (dependencies?: ComponentDependencies) => {
  return !!dependencies && Object.keys(dependencies.componentDependencies).length === 0
}

const loadDependencies = {
  ['EE_model']: [
    {
      key: 'dependencies',
      eval: (dependencies?: ComponentDependencies) => componentDependenciesLoaded(dependencies)
    }
  ]
} as Record<string, DependencyEval[]>

const buildComponentDependencies = (entity: Entity, json: GLTF.IGLTF) => {
  const dependencies = {
    componentDependencies: {}
  } as ComponentDependencies

  if (!json.nodes) return dependencies
  for (const node of json.nodes) {
    if (node.extensions && node.extensions[UUIDComponent.jsonID]) {
      const ext = node.extensions[UUIDComponent.jsonID] as EntityID | { entityID: EntityID }
      const nodeID = typeof ext === 'string' ? ext : (ext!.entityID as EntityID)
      const sourceID = GLTFComponent.getSourceID(entity)
      const uuid = UUIDComponent.join({ entitySourceID: sourceID, entityID: nodeID })
      const extensions = Object.keys(node.extensions)
      if (typeof node.extensions[SceneDynamicLoadComponent.jsonID] !== 'undefined') continue
      for (const extension of extensions) {
        if (loadDependencies[extension]) {
          if (!dependencies.componentDependencies[uuid]) dependencies.componentDependencies[uuid] = []
          dependencies.componentDependencies[uuid].push(ComponentJSONIDMap.get(extension)!)
        }
      }
    }
  }

  return dependencies
}

export const GLTFComponentReactor = () => {
  const entity = useEntityContext()
  const gltfComponent = useComponent(entity, GLTFComponent)
  const documentLoaded = useHookstate(false)
  const sceneLoaded = GLTFComponent.useSceneLoaded(entity)

  useEffect(() => {
    if (!sceneLoaded) return

    const occlusion = gltfComponent.cameraOcclusion.value
    const source = UUIDComponent.getAsSourceID(entity)
    const entities = UUIDComponent.getEntitiesBySource(source)

    if (!occlusion) {
      ObjectLayerMaskComponent.disableLayer(entity, ObjectLayers.Camera)
      for (const curr of entities) {
        ObjectLayerMaskComponent.disableLayer(curr, ObjectLayers.Camera)
      }
    } else {
      ObjectLayerMaskComponent.enableLayer(entity, ObjectLayers.Camera)
      for (const curr of entities) {
        ObjectLayerMaskComponent.enableLayer(curr, ObjectLayers.Camera)
      }
    }
  }, [gltfComponent.cameraOcclusion.value, sceneLoaded])

  useGLTFDocument(entity)

  const sourceID = GLTFComponent.getSourceID(entity)

  useEffect(() => {
    getMutableState(AssetState)[sourceID].set(entity)
    return () => {
      getMutableState(AssetState)[sourceID].set(none)
    }
  }, [gltfComponent.src])

  useEffect(() => {
    const gltfComponent = getComponent(entity, GLTFComponent)
    if (!gltfComponent.document) return

    const options = getGLTFOptions(entity)
    const url = options.url

    const sceneIndex = options.document.scene || 0
    let aborted = false
    removeComponent(entity, AnimationComponent)

    const layer = LayerComponent.get(entity)
    const unloadEntities = () => {
      const loadedEntities = UUIDComponent.getEntitiesBySource(sourceID, layer)
      for (const entity of loadedEntities) removeEntity(entity)
    }

    GLTFLoaderFunctions.loadScene(options, sceneIndex).then(() => {
      documentLoaded.set(true)

      // force transform update for all entities in the model.
      // required to propagate dirty update auth to sim layers
      TransformComponent.dirty[entity] = 1

      if (aborted) {
        unloadEntities()
      }
    })

    return () => {
      documentLoaded.set(false)
      GLTFLoaderFunctions.unloadScene(url, entity)
      aborted = true
      unloadEntities()
      if (hasComponent(entity, GLTFComponent)) {
        getMutableComponent(entity, GLTFComponent).progress.set(0)
      }
    }
  }, [gltfComponent.document])

  const scene = useOptionalComponent(entity, SceneComponent)

  useEffect(() => {
    if (!sceneLoaded || !scene) return
    setComponent(entity, SceneComponent, { active: true })
  }, [sceneLoaded, !!scene])

  const dependencies = gltfComponent.dependencies.get(NO_PROXY_STEALTH) as ComponentDependencies | undefined

  return (
    <>
      <ResourceReactor documentID={sourceID} entity={entity} documentLoaded={documentLoaded.value} />
      {dependencies && !componentDependenciesLoaded(dependencies) ? (
        <DependencyReactor key={entity} gltfComponentEntity={entity} dependencies={dependencies} />
      ) : null}
    </>
  )
}

const ResourceReactor = (props: { documentID: SourceID; entity: Entity; documentLoaded: boolean }) => {
  const dependenciesLoaded = GLTFComponent.useDependenciesLoaded(props.entity)
  const resourceQuery = useQuery([ResourcePendingComponent])

  const simulationEntity = getSimulationCounterpart(props.entity)
  useApplyCollidersToChildMeshesEffect(simulationEntity)

  useEffect(() => {
    if (!hasComponent(props.entity, GLTFComponent) || !props.documentLoaded) return
    if (getComponent(props.entity, GLTFComponent).progress === 100) return
    const entities = resourceQuery.filter((e) => UUIDComponent.getSourceEntity(e) === props.entity)
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
  }, [resourceQuery, dependenciesLoaded, props.documentLoaded])

  return null
}

const ComponentReactor = (props: { gltfComponentEntity: Entity; entity: Entity; component: Component }) => {
  const { gltfComponentEntity, entity, component } = props
  const dependencies = loadDependencies[component.jsonID!]
  const comp = useComponent(entity, component)
  const errors = ErrorComponent.useComponentErrors(entity, component)

  const removeGLTFDependency = () => {
    const gltfComponent = getMutableComponent(gltfComponentEntity, GLTFComponent)
    const uuid = UUIDComponent.get(entity)
    ;(gltfComponent.dependencies as State<ComponentDependencies>).componentDependencies.set((prev) => {
      const dependencyArr = prev![uuid] as Component[]
      if (!dependencyArr) return prev
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

const DependencyEntryReactor = (props: { gltfComponentEntity: Entity; uuid: EntityUUID; components: Component[] }) => {
  const { gltfComponentEntity, uuid, components } = props
  const layer = LayerComponent.get(gltfComponentEntity)
  const entity = UUIDComponent.useEntityByUUID(uuid as EntityUUID, layer) as Entity | undefined
  const hasComponents = useHasComponents(entity ?? UndefinedEntity, components)
  const dynamicLoad = useHasComponent(entity ?? UndefinedEntity, SceneDynamicLoadComponent)
  return entity && !dynamicLoad && hasComponents ? (
    <>
      {components.map((component) => {
        return (
          <Suspense key={component.jsonID} fallback={null}>
            <ComponentReactor
              key={`${uuid}-${component.jsonID}`}
              gltfComponentEntity={gltfComponentEntity}
              entity={entity}
              component={component}
            />
          </Suspense>
        )
      })}
    </>
  ) : null
}

const DependencyReactor = (props: { gltfComponentEntity: Entity; dependencies: ComponentDependencies }) => {
  const { gltfComponentEntity, dependencies } = props
  const componentDependencies = Object.entries(dependencies.componentDependencies)

  useEffect(() => {
    return () => {
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
            uuid={uuid as EntityUUID}
            components={components}
          />
        )
      })}
    </>
  )
}

const onProgress: (event: ProgressEvent) => void = (event) => {
  // console.log(event)
}

/* BINARY EXTENSION */
export const BINARY_EXTENSION_HEADER_MAGIC = 'glTF'
export const BINARY_EXTENSION_HEADER_LENGTH = 12
export const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4e4f534a, BIN: 0x004e4942 }

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

    try {
      if (typeof data === 'string') {
        json = JSON.parse(data)
      } else if ('byteLength' in data) {
        const magic = textDecoder.decode(new Uint8Array(data, 0, 4))

        if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
          const { json: jsonContent, body: bodyContent } = parseBinaryData(data)
          body = bodyContent
          json = jsonContent
        } else {
          json = JSON.parse(textDecoder.decode(data))
        }
      } else {
        json = data
      }

      onLoad(parseStorageProviderURLs(JSON.parse(JSON.stringify(json))), body)
    } catch (error) {
      if (onError) onError(error)
      return
    }
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

  const dynamicLoadComponent = useOptionalComponent(entity, SceneDynamicLoadComponent)
  const layer = LayerComponent.get(entity)
  const isEditing = layer === Layers.Authoring

  const dynamicLoadAndNotEditing = !isEditing && !!dynamicLoadComponent && !dynamicLoadComponent?.loaded?.value

  useEffect(() => {
    if (dynamicLoadAndNotEditing) return
    if (!url) {
      addError(entity, GLTFComponent, 'INVALID_SOURCE', 'Invalid URL')
      return
    }

    const abortController = new AbortController()
    const signal = abortController.signal

    const onError = (error: ErrorEvent) => {
      addError(entity, GLTFComponent, 'LOADING_ERROR', 'Error loading model')
    }

    loadGLTFFile(
      url,
      (gltf, body) => {
        if (body) state.body.set(body)
        state.document.set(gltf)
        const dependencies = buildComponentDependencies(entity, gltf)
        state.dependencies.set(dependencies)
      },
      onProgress,
      onError,
      signal
    )

    return () => {
      abortController.abort()
      if (!hasComponent(entity, GLTFComponent)) return
      const gltfComponent = getMutableComponent(entity, GLTFComponent)
      gltfComponent.document.set(null)
      gltfComponent.body.set(null)
      gltfComponent.progress.set(0)
    }
  }, [url, dynamicLoadAndNotEditing])
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
  const hasModel = useHasComponent(entity, GLTFComponent)
  const isChildOfModel = !!useAncestorWithComponents(entity, [GLTFComponent, SceneComponent])
  const hasMesh = useHasComponent(entity, MeshComponent)
  return hasModel || (hasMesh && !isChildOfModel)
}

export const getGLTFOptions = (entity: Entity): GLTFParserOptions => {
  const gltfComponent = getComponent(entity, GLTFComponent)
  const document = gltfComponent.document!
  const manager = getState(AssetLoaderState).manager

  return {
    entity,
    document,
    url: gltfComponent.src,
    path: LoaderUtils.extractUrlBase(gltfComponent.src),
    body: gltfComponent.body,
    requestHeader: {},
    manager
  }
}
