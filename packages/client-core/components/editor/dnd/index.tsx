import { NativeTypes } from "react-dnd-html5-backend";

/**
 * [ItemTypes object containing types of items used]
 * @type {Object}
 */
export const ItemTypes = {
  File: NativeTypes.FILE,
  Node: "Node",
  Model: "Model",
  Image: "Image",
  Video: "Video",
  Audio: "Audio",
  Volumetric: "Volumetric",
  Element: "Element"
};

/**
 * [AssetTypes array containing types of items used]
 * @type {Array}
 */
export const AssetTypes = [
  ItemTypes.Model,
  ItemTypes.Image,
  ItemTypes.Video,
  ItemTypes.Audio,
  ItemTypes.Volumetric,
  ItemTypes.Element
];

/**
 * [isAsset function to check item exists in array types or not]
 * @param {object} item
 */
export function isAsset(item) {
  return AssetTypes.indexOf(item.type) !== -1;
}

/**
 * [addAssetOnDrop used to adding assets to the editor scene]
 * @param {Object} editor
 * @param {Object} item
 * @param {Object} parent
 * @param {Object} before
 */
export function addAssetOnDrop(editor, item, parent?, before?) {
  if (isAsset(item)) {
    const { nodeClass, initialProps } = item.value;
    const node = new nodeClass(editor);
    if (initialProps) {
      Object.assign(node, initialProps);
    }
    editor.addObject(node, parent, before);
    return true;
  }
  return false;
}

/**
 * [addAssetAtCursorPositionOnDrop used to add element on editor scene position using cursor]
 * @param {Object} editor
 * @param {Object} item
 * @param {Object} mousePos
 */
export function addAssetAtCursorPositionOnDrop(editor, item, mousePos) {
  if (isAsset(item)) {
    const { nodeClass, initialProps } = item.value;
    const node = new nodeClass(editor);
    if (initialProps) {
      Object.assign(node, initialProps);
    }
    editor.getCursorSpawnPosition(mousePos, node.position);
    editor.addObject(node);
    return true;
  }
  return false;
}
