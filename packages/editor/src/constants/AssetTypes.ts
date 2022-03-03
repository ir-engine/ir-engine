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
  Audios: ['mp3', 'mpeg', 'audio/mpeg'],
  Images: ['png', 'jpeg', 'jpg', 'gif', 'image/png', 'image/jpeg'],
  Models: ['glb', 'gltf', 'model/gltf'],
  Scripts: ['tsx', 'ts', 'jsx', 'js'],
  Videos: ['mp4', 'm3u8', 'video/mp4'],
  Volumetrics: ['drcs', 'uvol'],
  Node: 'Node',
  Prefab: 'Prefab'
}

export const SupportedFileTypes = [
  ...ItemTypes.Images,
  ...ItemTypes.Audios,
  ...ItemTypes.Videos,
  ...ItemTypes.Volumetrics,
  ...ItemTypes.Models,
  ...ItemTypes.Scripts,
  ItemTypes.Folder,
  ItemTypes.File
]
