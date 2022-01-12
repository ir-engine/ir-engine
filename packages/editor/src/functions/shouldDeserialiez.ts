import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { ScenePrefabTypes } from '@xrengine/engine/src/scene/functions/registerPrefabs'

export const shouldNodeDeserialize = (node: EntityTreeNode, world = useWorld()): boolean => {
  const entityNode = getComponent(node.entity, EntityNodeComponent)

  if (!entityNode) return true

  for (let i = 0; i < entityNode.components.length; i++) {
    const loadingRegister = world.sceneLoadingRegistry.get(entityNode.components[i])
    if (loadingRegister && loadingRegister.shouldDeserialize && !loadingRegister.shouldDeserialize()) return false
  }

  return true
}

export const shouldPrefabDeserialize = (prefabType: ScenePrefabTypes, world = useWorld()): boolean => {
  const prefab = world.scenePrefabRegistry.get(prefabType)

  if (!prefab) return false

  for (let i = 0; i < prefab.length; i++) {
    const loadingRegister = world.sceneLoadingRegistry.get(prefab[i].name)
    if (loadingRegister && loadingRegister.shouldDeserialize && !loadingRegister.shouldDeserialize()) return false
  }

  return true
}
