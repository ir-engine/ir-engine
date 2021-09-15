import { NativeTypes } from 'react-dnd-html5-backend'
import { CommandManager } from '../../managers/CommandManager'
import EditorCommands from '../../constants/EditorCommands'
import { SceneManager } from '../../managers/SceneManager'

/**
 * ItemTypes object containing types of items used.
 *
 * @author Robert Long
 * @type {Object}
 */
export const ItemTypes = {
  File: NativeTypes.FILE,
  Node: 'Node',
  Model: 'Model',
  Image: 'Image',
  Video: 'Video',
  Audio: 'Audio',
  Volumetric: 'Volumetric',
  Element: 'Element'
}

/**
 * AssetTypes array containing types of items used.
 *
 * @author Robert Long
 * @type {Array}
 */
export const AssetTypes = [
  ItemTypes.Model,
  ItemTypes.Image,
  ItemTypes.Video,
  ItemTypes.Audio,
  ItemTypes.Volumetric,
  ItemTypes.Element
]

/**
 * isAsset function to check item exists in array types or not.
 *
 * @author Robert Long
 * @param {object} item
 */
export function isAsset(item) {
  return AssetTypes.indexOf(item.type) !== -1
}

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
    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node, { parent, before })
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
