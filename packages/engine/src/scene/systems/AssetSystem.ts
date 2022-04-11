import { Object3D } from 'three'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { AssetType } from '@xrengine/engine/src/assets/enum/AssetType'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  removeEntityNodeChild,
  removeEntityNodeFromParent,
  reparentEntityNode,
  traverseEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'

import { AssetComponent, AssetId, AssetLoadedComponent } from '../components/AssetComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { preCacheAssets } from '../functions/SceneLoading'

export default async function AssetSystem(world: World) {
  //const assetQuery = defineQuery([AssetComponent, AssetLoadedComponent])
  return () => {}
  /*
  const nodeMap = world.entityTree.entityNodeMap
  return () => {
    for (const entity of assetQuery.enter()) {
      const ass = getComponent(entity, AssetComponent)
      if ( AssetLoader.getAssetType(ass.path) !== AssetType.XRE ) {
        throw Error('only .xre.gltf files currently supported')
      }
      AssetLoader.load(ass.path, (result : EntityTreeNode) => {
        console.log("loaded asset to node", result, "from", ass.path)
        reparentEntityNode(result, nodeMap.get(entity)!)
        ass.loaded = true
      })
    }

    for (const entity of assetQuery.exit()) {
      const node = nodeMap.get(entity)!
      const ass = getComponent(entity, AssetComponent)
      const children = new Array()
      traverseEntityNode(node, (child) => {
        if (child.entity === entity) return
        removeEntity(child.entity, true)
        children.push(child)
      })
      children.forEach((child) => removeEntityNodeFromParent(child))
      ass.loaded = false
    }
  }*/
}
