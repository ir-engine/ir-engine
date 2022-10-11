import exportModelGLTF from '@xrengine/engine/src/assets/functions/exportModelGLTF'
import { pathResolver } from '@xrengine/engine/src/assets/functions/pathResolver'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'

import { accessEditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'

export default async function exportGLTF(entity: Entity, path: string) {
  const isGLTF = /\.gltf$/.test(path)
  const gltf = await exportModelGLTF(entity, {
    path,
    binary: !isGLTF,
    embedImages: !isGLTF,
    includeCustomExtensions: true
  }) //, {binary: false, embedImages: false, includeCustomExtensions: true})
  //const pName = accessEditorState().projectName.value!
  const [, , pName, fileName] = pathResolver().exec(path)!
  const blob = isGLTF ? [JSON.stringify(gltf)] : [gltf]
  const file = new File(blob, fileName)
  const urls = await Promise.all(uploadProjectFiles(pName, [file]).promises)
  console.log('exported model data to ', ...urls)
}
