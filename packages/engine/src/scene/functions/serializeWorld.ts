import { MathUtils } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ComponentJson, EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import {
  getAllComponents,
  getComponent,
  getOptionalComponent,
  hasComponent,
  serializeComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent, iterateEntityNode } from '../../ecs/functions/EntityTree'
import { getSceneMetadataChanges } from '../../ecs/functions/getSceneMetadataChanges'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { NameComponent } from '../components/NameComponent'
import { LoadState, PrefabComponent } from '../components/PrefabComponent'
import { UUIDComponent } from '../components/UUIDComponent'

export const serializeEntity = (entity: Entity) => {
  const ignoreComponents = getOptionalComponent(entity, GLTFLoadedComponent)

  const jsonComponents = [] as ComponentJson[]
  const components = getAllComponents(entity)

  for (const component of components) {
    const sceneComponentID = Engine.instance.sceneComponentRegistry.get(component.name)!
    if (
      sceneComponentID &&
      !ignoreComponents?.includes(component.name) &&
      Engine.instance.sceneLoadingRegistry.has(sceneComponentID)
    ) {
      const serialize = Engine.instance.sceneLoadingRegistry.get(sceneComponentID)?.serialize
      const data = serialize ? serialize(entity) : serializeComponent(entity, component)
      if (data) {
        jsonComponents.push({
          name: sceneComponentID,
          props: Object.assign({}, JSON.parse(JSON.stringify(data)))
        })
      }
    }
  }
  return jsonComponents
}

export const serializeWorld = (rootEntity?: Entity, generateNewUUID = false) => {
  const sceneJson = {
    version: 0,
    metadata: getSceneMetadataChanges(),
    entities: {},
    root: null! as EntityUUID
  }

  const sceneEntity = getState(SceneState).sceneEntity

  const traverseNode = rootEntity ?? sceneEntity
  const loadedAssets = new Set<Entity>()
  iterateEntityNode(
    traverseNode,
    (entity, index) => {
      const ignoreComponents = getOptionalComponent(entity, GLTFLoadedComponent)

      if (ignoreComponents?.includes('entity')) return

      const uuid = generateNewUUID ? (MathUtils.generateUUID() as EntityUUID) : getComponent(entity, UUIDComponent)
      const entityJson = (sceneJson.entities[uuid] = { components: [] as ComponentJson[] } as EntityJson)

      const entityTree = getComponent(entity, EntityTreeComponent)

      if (entity !== sceneEntity) {
        entityJson.parent = getComponent(entityTree.parentEntity!, UUIDComponent)
        entityJson.index = index
      }

      if (entity === rootEntity || !entityTree.parentEntity) {
        sceneJson.root = uuid
      }

      entityJson.name = getComponent(entity, NameComponent)

      entityJson.components = serializeEntity(entity)

      if (hasComponent(entity, PrefabComponent)) {
        const asset = getComponent(entity, PrefabComponent)
        if (asset.loaded === LoadState.LOADED) {
          asset.roots.map((root) => loadedAssets.add(root))
        }
      }
    },
    (node) => !loadedAssets.has(node),
    true
  )

  return sceneJson
}
