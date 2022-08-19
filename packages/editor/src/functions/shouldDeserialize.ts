import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getAllComponents } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ScenePrefabTypes } from '@xrengine/engine/src/scene/functions/registerPrefabs'

export const shouldNodeDeserialize = (node: EntityTreeNode, world = Engine.instance.currentWorld) => {
  const components = getAllComponents(node.entity)

  for (const component of components) {
    const sceneComponentID = world.sceneComponentRegistry.get(component._name)!
    if (sceneComponentID) {
      const loadingRegister = world.sceneLoadingRegistry.get(sceneComponentID)
      if (loadingRegister && loadingRegister.shouldDeserialize && !loadingRegister.shouldDeserialize()) return false
    }
  }

  return true
}

export const shouldPrefabDeserialize = (prefabType: ScenePrefabTypes, world = Engine.instance.currentWorld) => {
  const prefab = world.scenePrefabRegistry.get(prefabType)

  if (!prefab) return false

  for (let i = 0; i < prefab.length; i++) {
    const loadingRegister = world.sceneLoadingRegistry.get(prefab[i].name)
    if (loadingRegister && loadingRegister.shouldDeserialize && !loadingRegister.shouldDeserialize()) return false
  }

  return true
}
