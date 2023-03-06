import { createActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { ProjectUpdateActions, ProjectUpdateReceptors } from '../admin/services/ProjectUpdateService'

export default async function ProjectUpdateSystem() {
  const initializeProjectUpdateQueue = createActionQueue(ProjectUpdateActions.initializeProjectUpdate.matches)
  const clearProjectUpdateQueue = createActionQueue(ProjectUpdateActions.clearProjectUpdates.matches)
  const setProjectUpdateFieldQueue = createActionQueue(ProjectUpdateActions.setProjectUpdateField.matches)
  const mergeProjectUpdateFieldQueue = createActionQueue(ProjectUpdateActions.mergeProjectUpdateField.matches)

  const execute = () => {
    for (const action of initializeProjectUpdateQueue()) ProjectUpdateReceptors.initializeProjectUpdateReceptor(action)
    for (const action of clearProjectUpdateQueue()) ProjectUpdateReceptors.clearProjectUpdateReceptor(action)
    for (const action of setProjectUpdateFieldQueue()) ProjectUpdateReceptors.setProjectUpdateFieldReceptor(action)
    for (const action of mergeProjectUpdateFieldQueue()) ProjectUpdateReceptors.mergeProjectUpdateFieldReceptor(action)
  }

  const cleanup = async () => {
    removeActionQueue(initializeProjectUpdateQueue)
    removeActionQueue(clearProjectUpdateQueue)
    removeActionQueue(setProjectUpdateFieldQueue)
    removeActionQueue(mergeProjectUpdateFieldQueue)
  }

  return { execute, cleanup }
}
