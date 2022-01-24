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
  Folder: 'folder',
  FileBrowserContent: [
    'png',
    'jpeg',
    'jpg',
    'gif',
    'gltf',
    'glb',
    'mp4',
    'mp3',
    'mpeg',
    'tsx',
    'ts',
    'js',
    'drcs',
    'uvol',
    NativeTypes.FILE,
    'folder',
    'image/png',
    'image/jpeg',
    'video/mp4',
    'audio/mpeg',
    'model/gltf'
  ],
  Audios: ['mp3', 'mpeg'],
  Images: ['png', 'jpeg', 'jpg', 'gif'],
  Models: ['glb', 'gltf'],
  Scripts: ['tsx', 'ts', 'jsx', 'js'],
  Videos: ['mp4', 'm3u8'],
  Volumetrics: ['drcs', 'uvol'],
  //TODO: Need to check if following types are really used or not.
  Node: 'Node',
  Model: 'Model',
  Image: 'Image',
  Video: 'Video',
  Volumetric: 'Volumetric',
  Audio: 'Audio',
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
