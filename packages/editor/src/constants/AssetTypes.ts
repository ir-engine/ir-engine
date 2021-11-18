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
    'jpg',
    'gif',
    'gltf',
    'mp4',
    'mp3',
    'mpeg',
    'tsx',
    'ts',
    'js',
    NativeTypes.FILE,
    'folder',
    'image/png',
    'image/jpeg',
    'video/mp4',
    'audio/mpeg',
    'model/gltf'
  ],
  Images: ['png', 'jpeg', 'jpg', 'gif'],
  Videos: ['mp4'],
  Audios: ['mp3', 'mpeg'],
  //TODO: Need to check if following types are really used or not.
  Node: 'Node',
  Model: 'Model',
  Script: ['tsx', 'ts', 'jsx', 'js'],
  Shopify: 'Shopify',
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
