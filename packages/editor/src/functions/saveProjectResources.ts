import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getState } from '@etherealengine/hyperflux'
import { EditorState } from '../services/EditorServices'

export async function saveProjectResources() {
  const project = getState(EditorState).projectName!

  await Engine.instance.api.service('project-resources').create({ project })
}
