import { API } from '@etherealengine/client-core/src/API'
import { MultiError } from '@etherealengine/client-core/src/util/errors'
import { ProjectInterface } from '@etherealengine/common/src/interfaces/ProjectInterface'
import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { dispatchAction } from '@etherealengine/hyperflux'

import { copy, paste } from '../functions/copyPaste'
import { EditorErrorAction } from '../services/EditorErrorServices'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'
import { EditorControlFunctions } from './EditorControlFunctions'
import { initializeScene } from './sceneRenderFunctions'

/**
 * Gets a list of projects installed
 * @returns {ProjectInterface[]}
 */
export const getProjects = async (): Promise<ProjectInterface[]> => {
  try {
    const { data } = await API.instance.client.service('project').find({
      query: { allowed: true }
    })
    return data
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Loads scene from provided project file.
 */
export async function loadProjectScene(projectData: SceneData) {
  EditorControlFunctions.replaceSelection([])

  disposeProject()

  const errors = await initializeScene(projectData)

  dispatchAction(EditorAction.projectLoaded({ loaded: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))

  if (errors && errors.length > 0) {
    const error = new MultiError('Errors loading project', errors)
    dispatchAction(EditorErrorAction.throwError({ error }))
    throw error
  }

  window.addEventListener('copy', copy)
  window.addEventListener('paste', paste)
}

/**
 * Disposes project data
 */
export function disposeProject() {
  dispatchAction(EditorAction.projectLoaded({ loaded: false }))

  window.addEventListener('copy', copy)
  window.addEventListener('paste', paste)
}
