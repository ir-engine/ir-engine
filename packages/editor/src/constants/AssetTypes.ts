import { NativeTypes } from 'react-dnd-html5-backend'

/**
 * ItemTypes object containing types of items used.
 *
 * @author Robert Long
 * @author Abhishek Pathak
 * @type {Object}
 */
export const ItemTypes = {
  File: NativeTypes.FILE,
  FileBrowserContent: [
    'png',
    'jpeg',
    'gltf',
    'mp4',
    'mpeg',
    NativeTypes.FILE,
    'folder',
    'image/png',
    'image/jpeg',
    'video/mp4',
    'audio/mpeg',
    'model/gltf'
  ],
  Node: 'Node',
  Model: 'Model',
  Shopify: 'Shopify',
  Instagram: 'Instagram',
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
  ItemTypes.Shopify,
  ItemTypes.Instagram,
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
