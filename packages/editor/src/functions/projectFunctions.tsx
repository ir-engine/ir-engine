import { API } from '@etherealengine/client-core/src/API'
import { ProjectInterface } from '@etherealengine/common/src/interfaces/ProjectInterface'
import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { EditorHistoryAction } from '../services/EditorHistory'
import { EditorControlFunctions } from './EditorControlFunctions'

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

  dispatchAction(EditorHistoryAction.clearHistory({}))

  getMutableState(SceneState).sceneData.set(projectData)
}
