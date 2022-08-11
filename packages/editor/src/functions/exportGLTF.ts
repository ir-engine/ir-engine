import exportModelGLTF from '@xrengine/engine/src/assets/functions/exportModelGLTF'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'

import { useEditorState } from '../services/EditorServices'
import { uploadProjectFile } from './assetFunctions'

export default async function exportGLTF(entity: Entity) {
  const model = getComponent(entity, ModelComponent)
  const gltf = await exportModelGLTF(entity)
  const editorState = useEditorState()
  const file = new File([gltf], /[^\/]+$/.exec(model.src)![0])
  const urls = await uploadProjectFile(editorState.projectName.get()!, [file], true)
  console.log('exported model data to ', ...urls)
}
