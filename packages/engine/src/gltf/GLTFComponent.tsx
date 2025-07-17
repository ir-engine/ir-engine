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
import React, { Suspense, useEffect } from 'react'

import {
  Component,
  ComponentJSONIDMap,
  defineComponent,
  Entity,
  entityExists,
  EntityID,
  EntityUUID,
  getAncestorWithComponents,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getSimulationCounterpart,
  hasComponent,
  LayerComponent,
  LayerID,
  Layers,
  removeComponent,
  SimulationLayerComponent,
  SourceID,
  UndefinedEntity,
  useAncestorWithComponents,
  useComponent,
  useEntityContext,
  useHasComponent,
  useHasComponents,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import {
  getMutableState,
  getState,
  NO_PROXY,
  NO_PROXY_STEALTH,
  none,
  SceneUser,
  State,
  useMutableState
} from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { ShapeSchema } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { FileLoader } from '@ir-engine/spatial/src/resources/loaders/base/FileLoader'
import { parseStorageProviderURLs } from '@ir-engine/spatial/src/resources/parseSceneJSON'
import { loadResource } from '@ir-engine/spatial/src/resources/resourceLoaderFunctions'
import { ResourceProgressComponent } from '@ir-engine/spatial/src/resources/ResourceProgressComponent'
import { ResourceType } from '@ir-engine/spatial/src/resources/ResourceState'
import { LoaderUtils } from 'three'
import { AssetLoaderState } from '../assets/state/AssetLoaderState'
import { AuthoringState, HistoryCommand } from '../authoring/AuthoringState'
import { AnimationComponent } from '../avatar/components/AnimationComponent'
import { ErrorComponent } from '../scene/components/ErrorComponent'
import { SceneDynamicLoadComponent } from '../scene/components/SceneDynamicLoadComponent'
import { addError, removeError } from '../scene/functions/ErrorFunctions'
import { GLTFLoaderFunctions, GLTFParserOptions } from './GLTFLoaderFunctions'
import { AssetState } from './GLTFState'
import { migrateEEMaterial } from './migrateEEMaterial'
import { OVERRIDE_EXTENSION_NAME } from './overrideExporterExtension'
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
    loaded: S.Bool({ default: false, serialized: false }),
    document: S.Type<GLTF.IGLTF | null>({ serialized: false }),
    progress: S.Number({ default: 0, serialized: false }),
    extensions: S.Record(S.String(), S.Any(), { serialized: false }),
    dependencies: S.Type<Dependencies | undefined>({ serialized: false })
  }),

  errors: ['LOADING_ERROR', 'INVALID_SOURCE'],

  useDependenciesLoaded(entity: Entity) {
    const dependencies = useComponent(entity, GLTFComponent).dependencies
    return dependenciesLoaded(dependencies.value as Dependencies | undefined)
  },

  useSceneLoaded(entity: Entity) {
    const gltfComponent = useOptionalComponent(entity, GLTFComponent)
    if (!gltfComponent) return false
    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress.value
    return dependenciesLoaded(dependencies.value as Dependencies | undefined) && progress === 100
  },

  isSceneLoaded(entity: Entity) {
    const gltfComponent = getOptionalComponent(entity, GLTFComponent)
    if (!gltfComponent) return false
    const dependencies = gltfComponent.dependencies
    const progress = gltfComponent.progress
    return dependenciesLoaded(dependencies) && progress === 100
  },

  getEntityBySourceAndID(source: Entity, id: EntityID, layer = Layers.Simulation as LayerID) {
    return UUIDComponent.getEntityByUUID(
      ((GLTFComponent.getSourceID(source) || UUIDComponent.get(source)) + id) as EntityUUID,
      layer
    )
  },

  getOverrideUUID(entity: Entity, id: EntityID) {
    const rootUUID = UUIDComponent.getAsSourceID(entity)
    return UUIDComponent.join({ entitySourceID: rootUUID, entityID: id as EntityID })
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
  eval: (val: unknown, entity?: Entity) => boolean
}

type Dependencies = {
  componentDependencies: Record<EntityUUID, Component[]>
  deltaDependencies: Record<EntityUUID, number>
}

const dependenciesLoaded = (dependencies?: Dependencies) => {
  return (
    !!dependencies &&
    Object.keys(dependencies.componentDependencies).length === 0 &&
    Object.keys(dependencies.deltaDependencies).length === 0
  )
}

const checkCollider = (hasCollider: boolean, entity: Entity) => {
  if (!getAncestorWithComponents(entity, [RigidBodyComponent]) || !hasComponent(entity, SimulationLayerComponent))
    return true
  return hasCollider
}

const loadDependencies = {
  [GLTFComponent.jsonID]: [
    {
      key: 'progress',
      eval: (progress: number, entity: Entity) => progress === 100 || getComponent(entity, GLTFComponent).src === ''
    }
  ],
  [ColliderComponent.jsonID]: [
    {
      key: 'hasCollider',
      eval: (hasCollider: boolean, entity: Entity) => checkCollider(hasCollider, entity)
    }
  ]
} as Record<Exclude<Component['jsonID'], undefined>, DependencyEval[]>

const buildDependencies = (entity: Entity, json: GLTF.IGLTF) => {
  const dependencies = {
    componentDependencies: {},
    deltaDependencies: {}
  } as Dependencies

  const overrides = json.extensions?.[OVERRIDE_EXTENSION_NAME]
  if (overrides) {
    for (const [id, ops] of Object.entries(overrides)) {
      if (!ops.length) continue
      const overrideUUID = GLTFComponent.getOverrideUUID(entity, id as EntityID)
      if (!(overrideUUID in dependencies.deltaDependencies)) dependencies.deltaDependencies[overrideUUID] = 0
      dependencies.deltaDependencies[overrideUUID] += ops.length
    }
  }

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
    return () => {
      if (hasComponent(entity, GLTFComponent)) {
        const component = getMutableComponent(entity, GLTFComponent)
        component.loaded.set(false)
        component.progress.set(0)
      }
    }
  }, [])

  const dependencies = gltfComponent.dependencies.get(NO_PROXY_STEALTH) as Dependencies | undefined

  return (
    <>
      <ResourceReactor documentID={sourceID} entity={entity} loaded={gltfComponent.loaded.value} />
      {dependencies && !dependenciesLoaded(dependencies) ? (
        <DependencyReactor key={entity} gltfComponentEntity={entity} dependencies={dependencies} />
      ) : null}
    </>
  )
}

const ResourceReactor = (props: { documentID: SourceID; entity: Entity; loaded: boolean }) => {
  const { documentID, entity, loaded } = props
  const gltfComponent = useComponent(entity, GLTFComponent)
  const sourceEntities = UUIDComponent.useEntitiesBySource(documentID) as Entity[]

  const simulationEntity = getSimulationCounterpart(entity)
  useApplyCollidersToChildMeshesEffect(simulationEntity)

  if (!loaded || gltfComponent.progress.value === 100) return null

  return (
    <ChildResourceReactor
      rootEntity={entity}
      sourceEntities={sourceEntities}
      key={JSON.stringify([entity, ...sourceEntities])}
    />
  )
}

const ChildResourceReactor = (props: { rootEntity: Entity; sourceEntities: Entity[] }) => {
  const { rootEntity, sourceEntities } = props
  const entities = [rootEntity, ...sourceEntities]
  const resourceProgress = ResourceProgressComponent.useResourcesProgressForEntities(entities)
  const dependenciesLoaded = GLTFComponent.useDependenciesLoaded(rootEntity)

  useEffect(() => {
    const percentage = Math.floor(Math.min(resourceProgress, dependenciesLoaded ? 100 : 99))
    getMutableComponent(rootEntity, GLTFComponent).progress.set(percentage)
  }, [resourceProgress, dependenciesLoaded])

  useEffect(() => {
    if (resourceProgress !== 100) return

    const resourceEntities = entities.filter((entity) => hasComponent(entity, ResourceProgressComponent))

    for (const entity of resourceEntities) {
      removeComponent(entity, ResourceProgressComponent)
    }
  }, [resourceProgress])

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
    ;(gltfComponent.dependencies as State<Dependencies>).componentDependencies.set((prev) => {
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
      if (!dep.eval(compValue[dep.key], entity)) return
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

const DependencyReactor = (props: { gltfComponentEntity: Entity; dependencies: Dependencies }) => {
  const { gltfComponentEntity, dependencies } = props
  const componentDependencies = Object.entries(dependencies.componentDependencies)
  const deltaDependencies = dependencies.deltaDependencies

  const commands = useMutableState(AuthoringState).commands[SceneUser]

  useEffect(() => {
    return () => {
      removeError(gltfComponentEntity, GLTFComponent, 'LOADING_ERROR')
      removeError(gltfComponentEntity, GLTFComponent, 'INVALID_SOURCE')
    }
  }, [])

  useEffect(() => {
    const commandArr = commands.get(NO_PROXY) as HistoryCommand[] | undefined
    if (!commandArr) return

    for (const command of commandArr) {
      for (const overrideUUID in command) {
        if (!deltaDependencies[overrideUUID]) continue

        const remainingOps = deltaDependencies[overrideUUID] - command[overrideUUID].length
        if (remainingOps <= 0) {
          delete deltaDependencies[overrideUUID]
        } else {
          deltaDependencies[overrideUUID] = remainingOps
        }
      }
    }

    const gltfComponent = getMutableComponent(gltfComponentEntity, GLTFComponent)
    gltfComponent.dependencies.merge({ deltaDependencies })
  }, [commands])

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

/* BINARY EXTENSION */
export const BINARY_EXTENSION_HEADER_MAGIC = 'glTF'
export const BINARY_EXTENSION_HEADER_LENGTH = 12
export const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4e4f534a, BIN: 0x004e4942 }

export const parseGLTFFile = (
  data: string | ArrayBuffer | GLTF.IGLTF,
  onError: (error: ErrorEvent) => void
): [GLTF.IGLTF | null, ArrayBuffer | null] => {
  const textDecoder = new TextDecoder()
  let json: GLTF.IGLTF
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

    json = JSON.parse(JSON.stringify(json))

    json = migrateEEMaterial(json)
    return [parseStorageProviderURLs(json), body]
  } catch (error) {
    if (onError) onError(error)
    return [null, null]
  }
}

const useGLTFDocument = (entity: Entity) => {
  const state = useComponent(entity, GLTFComponent)
  const url = state.src.value

  const dynamicLoadComponent = useOptionalComponent(entity, SceneDynamicLoadComponent)
  const layer = LayerComponent.get(entity)
  const isEditing = layer === Layers.Authoring

  const dynamicLoadAndNotEditing = !isEditing && !!dynamicLoadComponent && !dynamicLoadComponent?.loaded?.value
  const gltfComponent = getMutableComponent(entity, GLTFComponent)
  useEffect(() => {
    if (dynamicLoadAndNotEditing) return
    if (!url) {
      gltfComponent.progress.set(100)
      return
    }

    const abortController = new AbortController()
    const signal = abortController.signal

    const onError = (error: ErrorEvent) => {
      addError(entity, GLTFComponent, 'LOADING_ERROR', 'Error loading model ' + url)
    }

    removeError(entity, GLTFComponent, 'LOADING_ERROR')

    const loader = new FileLoader()

    loader.setResponseType('arraybuffer')
    loader.setRequestHeader({})
    loader.setWithCredentials(false)

    loadResource<ArrayBuffer>(
      url,
      ResourceType.ArrayBuffer,
      entity,
      (response) => {
        if (signal.aborted) return

        const [gltf, body] = parseGLTFFile(response, onError)

        if (gltf) {
          state.document.set(gltf)
          const dependencies = buildDependencies(entity, gltf)
          state.dependencies.set(dependencies)

          // Load scene immediately while we have the body in scope
          const options = getGLTFOptions(entity, signal, body)
          const sceneIndex = options.document.scene || 0
          removeComponent(entity, AnimationComponent)

          GLTFLoaderFunctions.loadScene(options, sceneIndex)
            .then(() => {
              if (signal.aborted) return
              // Check if component still exists before setting state
              if (hasComponent(entity, GLTFComponent)) {
                // Scene loading is now handled in useGLTFDocument, so we just set documentLoaded
                getMutableComponent(entity, GLTFComponent).loaded.set(true)
                // force transform update for all entities in the model.
                // required to propagate dirty update auth to sim layers
                TransformComponent.dirty[entity] = 1
              }
              // Scene loading is complete, body can now be garbage collected
            })
            .catch((error) => {
              console.error('Error loading GLTF scene:', error)
              if (hasComponent(entity, GLTFComponent)) {
                addError(entity, GLTFComponent, 'LOADING_ERROR', 'Error loading GLTF scene: ' + error.message)
              }
            })
        }
      },
      (request) => {
        //this is the gtlf file loading progress, not to be confused with the GTLF Component property "progress" which tracks if the gtlf is loaded into the scene
      },
      onError,
      signal,
      loader
    )

    return () => {
      abortController.abort()
      if (!entityExists(entity) || !hasComponent(entity, GLTFComponent)) return
      const gltfComponent = getMutableComponent(entity, GLTFComponent)
      gltfComponent.document.set(null)
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

export const getGLTFOptions = (
  entity: Entity,
  signal: AbortSignal,
  body: ArrayBuffer | null = null
): GLTFParserOptions => {
  const gltfComponent = getComponent(entity, GLTFComponent)
  const document = gltfComponent.document!
  const manager = getState(AssetLoaderState).manager

  return {
    entity,
    document,
    url: gltfComponent.src,
    path: LoaderUtils.extractUrlBase(gltfComponent.src),
    body,
    requestHeader: {},
    manager,
    signal
  }
}
