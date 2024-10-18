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
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import { parseStorageProviderURLs } from '@ir-engine/engine/src/assets/functions/parseSceneJSON'
import { dispatchAction, getState, useHookstate } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import { BINARY_EXTENSION_HEADER_MAGIC, EXTENSIONS, GLTFBinaryExtension } from '../assets/loaders/gltf/GLTFExtensions'
import { ErrorComponent } from '../scene/components/ErrorComponent'
import { SourceComponent } from '../scene/components/SourceComponent'
import { SceneJsonType } from '../scene/types/SceneTypes'
import { migrateSceneJSONToGLTF } from './convertJsonToGLTF'
import { GLTFDocumentState, GLTFSnapshotAction } from './GLTFDocumentState'
import { ResourcePendingComponent } from './ResourcePendingComponent'

const loadDependencies = {
  ['EE_model']: ['scene']
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

  schema: S.Object({
    src: S.String(''),
    // internals
    extensions: S.Record(S.String(), S.Any(), {}),
    progress: S.Number(0),
    dependencies: S.Optional(S.Type<ComponentDependencies>())
  }),

  onSet(entity, component, json) {
    if (typeof json?.src === 'string') component.src.set(json.src)
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

    useGLTFDocument(gltfComponent.src.value, entity)

    const documentID = useComponent(entity, SourceComponent).value

    return (
      <>
        <ResourceReactor documentID={documentID} entity={entity} />
        {dependencies.value && dependencies.keys?.length ? (
          <DependencyReactor
            key={entity}
            gltfComponentEntity={entity}
            dependencies={dependencies.value as ComponentDependencies}
          />
        ) : null}
      </>
    )
  }
})

const ResourceReactor = (props: { documentID: string; entity: Entity }) => {
  const dependenciesLoaded = GLTFComponent.useDependenciesLoaded(props.entity)
  const resourceQuery = useQuery([SourceComponent, ResourcePendingComponent])
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
  }, [resourceQuery, sourceEntities, dependenciesLoaded])

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
    gltfComponent.dependencies.set((prev) => {
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
    for (const key of dependencies) {
      if (!compValue[key]) return
    }

    // console.log(`All dependencies loaded for entity: ${entity} on component: ${component.jsonID}`)
    removeGLTFDependency()
  }, [...dependencies.map((key) => comp[key])])

  useEffect(() => {
    if (!errors) return
    console.error(`GLTFComponent:ComponentReactor Component ${component.name} errored during loading`)
    removeGLTFDependency()
  }, [errors])

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
      } else if ('byteLength' in data) {
        // for some reason, "instanceof ArrayBuffer" is not working in node
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

      const dependencies = buildComponentDependencies(json)
      state.dependencies.set(dependencies)

      dispatchAction(
        GLTFSnapshotAction.createSnapshot({
          source: getComponent(entity, SourceComponent),
          data: parseStorageProviderURLs(structuredClone(json))
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
      state.merge({
        extensions: {}
      })
    }
  }, [url])
}
