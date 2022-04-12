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
  const assetQuery = defineQuery([AssetComponent, AssetLoadedComponent])

  const nodeMap = world.entityTree.entityNodeMap
  return () => {
    for (const entity of assetQuery.enter()) {
      const ass = getComponent(entity, AssetComponent)
      const load = getComponent(entity, AssetLoadedComponent)
      reparentEntityNode(load.root, nodeMap.get(entity)!)
      ass.loaded = true
    }
  }
}
