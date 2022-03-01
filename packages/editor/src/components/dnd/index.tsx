import { Vector2 } from 'three'

import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { isAsset } from '../../constants/AssetTypes'
import EditorCommands from '../../constants/EditorCommands'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'

/**
 * addAssetOnDrop used to adding assets to the editor scene.
 *
 * @author Robert Long
 * @param {Object} item
 * @param {Object} parent
 * @param {Object} before
 */
export function addItem(item: any, parent?: EntityTreeNode, before?: EntityTreeNode): boolean {
  if (!isAsset(item)) return false

  const entity = createEntity()

  CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, new EntityTreeNode(entity), {
    prefabTypes: item.nodeClass,
    parents: parent,
    befores: before
  })

  return true
}

/**
 * addItemAtCursorPosition used to add element on editor scene position using cursor.
 *
 * @author Robert Long
 * @param {Object} item
 * @param {Object} mousePos
 */
export function addItemAtCursorPosition(item, mousePos: Vector2): void {
  if (!isAsset(item)) return

  const entity = createEntity()

  CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, new EntityTreeNode(entity), {
    prefabTypes: item.nodeClass
  })

  const transformComponent = getComponent(entity, TransformComponent)
  if (transformComponent) transformComponent.position = SceneManager.instance.getCursorSpawnPosition(mousePos)
}
