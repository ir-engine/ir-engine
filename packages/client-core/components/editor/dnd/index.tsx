import { NativeTypes } from "react-dnd-html5-backend";
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
export const AssetTypes = [
  ItemTypes.Model,
  ItemTypes.Image,
  ItemTypes.Video,
  ItemTypes.Audio,
  ItemTypes.Volumetric,
  ItemTypes.Element
];
export function isAsset(item) {
  return AssetTypes.indexOf(item.type) !== -1;
}
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
