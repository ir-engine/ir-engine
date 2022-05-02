import { MathUtils } from 'three'

import { ComponentJson, EntityJson, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { iterateEntityNode, traverseEntityNode } from '../../ecs/functions/EntityTreeFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { AssetComponent, AssetLoadedComponent, LoadState } from '../components/AssetComponent'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { NameComponent } from '../components/NameComponent'

export const serializeWorld = (entityTreeNode?: EntityTreeNode, generateNewUUID = false, world = useWorld()) => {
  const entityUuid = {}
  const sceneJson = { version: 4, entities: {} } as SceneJson

  const traverseNode = entityTreeNode ?? world.entityTree.rootNode
  const loadedAssets = new Set<EntityTreeNode>()
  iterateEntityNode(
    traverseNode,
    (node, index) => {
      if (generateNewUUID) node.uuid = MathUtils.generateUUID()
      const entityJson = (sceneJson.entities[node.uuid] = { components: [] as ComponentJson[] } as EntityJson)

      if (node.parentEntity) {
        entityJson.parent = node.parentEntity as any
        entityJson.index = index
      }

      if (node === entityTreeNode || !node.parentEntity) {
        sceneJson.root = node.uuid
      }

      entityUuid[node.entity] = node.uuid
      entityJson.name = getComponent(node.entity, NameComponent)?.name

      const entityNode = getComponent(node.entity, EntityNodeComponent)

      if (entityNode?.components) {
        entityNode.components.forEach((comp) => {
          let data = world.sceneLoadingRegistry.get(comp)?.serialize(node.entity)
          if (data) entityJson.components.push(data)
        })
      }

      if (hasComponent(node.entity, AssetComponent)) {
        const asset = getComponent(node.entity, AssetComponent)
        if (asset.loaded === LoadState.LOADED) {
          const loaded = getComponent(node.entity, AssetLoadedComponent)
          loaded.roots?.forEach((root) => loadedAssets.add(root))
        }
      }
    },
    (node) => !loadedAssets.has(node)
  )

  Object.keys(sceneJson.entities).forEach((key) => {
    const entity = sceneJson.entities[key]
    if (entity.parent) entity.parent = entityUuid[entity.parent]
  })

  return sceneJson
}
