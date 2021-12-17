import { EntityJson, SceneJson, ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { MathUtils } from 'three'
import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { EntityNodeComponent } from '../components/EntityNodeComponent'
import { NameComponent } from '../components/NameComponent'

export const serializeWorld = (entityTreeNode?: EntityTreeNode, generateNewUUID = false, world = useWorld()) => {
  const entityUuid = {}
  const sceneJson = { version: 4, entities: {} } as SceneJson

  world.entityTree.traverse((node, index) => {
    node.uuid = generateNewUUID ? MathUtils.generateUUID() : getComponent(node.entity, EntityNodeComponent).uuid
    const entityJson = (sceneJson.entities[node.uuid] = { components: [] as ComponentJson[] } as EntityJson)

    if (node.parentNode) {
      entityJson.parent = node.parentNode.entity as any
      entityJson.index = index
    }

    if (node === entityTreeNode || !node.parentNode) {
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
  }, entityTreeNode)

  Object.keys(sceneJson.entities).forEach((key) => {
    const entity = sceneJson.entities[key]
    if (entity.parent) entity.parent = entityUuid[entity.parent]
  })

  return sceneJson
}
