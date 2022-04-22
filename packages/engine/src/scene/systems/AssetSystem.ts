import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  iterateEntityNode,
  removeEntityNodeFromParent,
  reparentEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'

import { AssetComponent, AssetLoadedComponent, LoadState } from '../components/AssetComponent'
import { reparentObject3D } from '../functions/ReparentFunction'

export default async function AssetSystem(world: World) {
  const assetQuery = defineQuery([AssetComponent, AssetLoadedComponent])

  const nodeMap = world.entityTree.entityNodeMap
  return () => {
    for (const entity of assetQuery.enter()) {
      const asset = getComponent(entity, AssetComponent)
      const load = getComponent(entity, AssetLoadedComponent)
      const node = nodeMap.get(entity)
      if (!node) continue
      load.roots.forEach((root) => {
        reparentEntityNode(root, node)
        reparentObject3D(root, node)
      })
      asset.loaded = LoadState.LOADED
    }

    for (const entity of assetQuery.exit()) {
      const node = nodeMap.get(entity)
      if (!node) continue
      const children = new Array()
      iterateEntityNode(node, (child, idx) => {
        if (child === node) return
        children.push(child)
      })
      children.forEach((child) => {
        removeEntityNodeFromParent(child)
        removeEntity(child.entity)
      })
      const asset = getComponent(entity, AssetComponent)
      asset.loaded = LoadState.UNLOADED
    }
  }
}
