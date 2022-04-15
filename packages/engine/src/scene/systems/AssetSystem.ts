import { store } from '@xrengine/client-core/src/store'
import { executeCommand } from '@xrengine/editor/src/classes/History'
import { EditorCommands } from '@xrengine/editor/src/constants/EditorCommands'
import { EditorAction } from '@xrengine/editor/src/services/EditorServices'
import { SelectionAction } from '@xrengine/editor/src/services/SelectionServices'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { iterateEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'

import { AssetComponent, AssetLoadedComponent, LoadState } from '../components/AssetComponent'

export default async function AssetSystem(world: World) {
  const assetQuery = defineQuery([AssetComponent, AssetLoadedComponent])

  const nodeMap = world.entityTree.entityNodeMap
  return () => {
    for (const entity of assetQuery.enter()) {
      const ass = getComponent(entity, AssetComponent)
      const load = getComponent(entity, AssetLoadedComponent)
      const node = nodeMap.get(entity)
      if (!node) continue
      executeCommand(EditorCommands.REPARENT, load.roots, { parents: node })
      ass.loaded = LoadState.LOADED
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedSceneGraph())
    }

    for (const entity of assetQuery.exit()) {
      const node = nodeMap.get(entity)
      if (!node) continue
      const children = new Array()
      iterateEntityNode(node, (child, idx) => {
        if (child === node) return
        children.push(child)
      })
      executeCommand(EditorCommands.REMOVE_OBJECTS, children, {
        deselectObject: true
      })
      const ass = getComponent(entity, AssetComponent)
      ass.loaded = LoadState.UNLOADED
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedSceneGraph())
    }
  }
}
