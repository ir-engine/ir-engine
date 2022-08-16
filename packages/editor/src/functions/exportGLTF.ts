import exportModelGLTF from '@xrengine/engine/src/assets/functions/exportModelGLTF'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'

import { accessEditorState } from '../services/EditorServices'
import { uploadProjectFile } from './assetFunctions'

export default async function exportGLTF(entity: Entity, path: string) {
  const isGLTF = /\.gltf$/.test(path)
  const gltf = await exportModelGLTF(entity, { binary: !isGLTF, embedImages: !isGLTF, includeCustomExtensions: true }) //, {binary: false, embedImages: false, includeCustomExtensions: true})
  const pName = accessEditorState().projectName.value!
  const blob = isGLTF ? [JSON.stringify(gltf)] : [gltf]
  const file = new File(blob, /[^\/]+$/.exec(path)![0])
  const urls = await Promise.all(uploadProjectFile(pName, [file], true).promises)
  console.log('exported model data to ', ...urls)
}
