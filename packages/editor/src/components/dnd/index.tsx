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
export function addAssetOnDrop(item, parent?, before?) {
  if (isAsset(item)) {
    const { nodeClass, initialProps } = item
    const node = new nodeClass()
    if (initialProps) {
      Object.assign(node, initialProps)
    }
    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node, {
      parents: parent,
      befores: before
    })
    return true
  }
  return false
}

/**
 * addAssetAtCursorPositionOnDrop used to add element on editor scene position using cursor.
 *
 * @author Robert Long
 * @param {Object} item
 * @param {Object} mousePos
 */
export function addAssetAtCursorPositionOnDrop(item, mousePos) {
  if (isAsset(item)) {
    const { nodeClass, initialProps } = item
    const node = new nodeClass()
    if (initialProps) {
      Object.assign(node, initialProps)
    }
    SceneManager.instance.getCursorSpawnPosition(mousePos, node.position)
    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node)

    return true
  }
  return false
}
