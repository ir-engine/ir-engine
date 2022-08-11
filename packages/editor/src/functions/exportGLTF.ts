import exportModelGLTF from '@xrengine/engine/src/assets/functions/exportModelGLTF'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'

import { accessEditorActiveInstanceState } from '../components/realtime/EditorActiveInstanceService'
import { accessEditorState } from '../services/EditorServices'
import { uploadProjectFile } from './assetFunctions'

export default async function exportGLTF(entity: Entity, path: string) {
  const isGLTF = /\.gltf$/.test(path)
  const gltf = await exportModelGLTF(entity, { binary: !isGLTF, embedImages: !isGLTF, includeCustomExtensions: true }) //, {binary: false, embedImages: false, includeCustomExtensions: true})
  const pName = accessEditorState().projectName.value!
  const blob = isGLTF ? [JSON.stringify(gltf)] : [gltf]
  const file = new File(blob, /[^\/]+$/.exec(path)![0])
  const urls = await uploadProjectFile(pName, [file], true)
  console.log('exported model data to ', ...urls)
}
