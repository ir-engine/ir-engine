import { none } from '@hookstate/core'

import { ProjectBranchInterface } from '@xrengine/common/src/interfaces/ProjectBranchInterface'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { ProjectTagInterface } from '@xrengine/common/src/interfaces/ProjectTagInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

const ProjectUpdateState = defineState({
  name: 'ProjectUpdateState',
  initial: () => ({})
})

const initializeProjectUpdateReceptor = (action: typeof ProjectUpdateActions.initializeProjectUpdate.matches._TYPE) => {
  const state = getState(ProjectUpdateState)
  return state[action.project.name].set({
    branchProcessing: false,
    destinationProcessing: false,
    sourceURL: '',
    destinationURL: '',
    destinationValid: false,
    destinationError: '',
    sourceValid: false,
    tagsProcessing: false,
    sourceURLError: '',
    branchError: '',
    tagError: '',
    showBranchSelector: false,
    showTagSelector: false,
    branchData: [],
    tagData: [],
    selectedBranch: '',
    sourceVsDestinationProcessing: false,
    sourceVsDestinationError: '',
    sourceProjectMatchesDestination: false,
    destinationProjectName: '',
    destinationRepoEmpty: false,
    sourceProjectName: '',
    sourceVsDestinationChecked: false,
    selectedSHA: '',
    projectName: '',
    submitDisabled: true,
    triggerSetDestination: false
  })
}

const clearProjectUpdateReceptor = (action: typeof ProjectUpdateActions.clearProjectUpdates.matches._TYPE) => {
  const state = getState(ProjectUpdateState)
  return state[action.project.name].set(none)
}

const setProjectUpdateFieldReceptor = (action: typeof ProjectUpdateActions.setProjectUpdateField.matches._TYPE) => {
  const state = getState(ProjectUpdateState)
  if (state[action.project.name] && state[action.project.name][action.fieldName])
    return state[action.project.name][action.fieldName].set(action.value)
  return state
}

export const ProjectUpdateReceptors = {
  initializeProjectUpdateReceptor,
  clearProjectUpdateReceptor,
  setProjectUpdateFieldReceptor
}

export const accessProjectUpdateState = () => getState(ProjectUpdateState)

export const useProjectUpdateState = () => useState(accessProjectUpdateState())

export const ProjectUpdateService = {
  initializeProjectUpdate: (project: ProjectInterface) => {
    dispatchAction(ProjectUpdateActions.initializeProjectUpdate({ project }))
  },
  clearProjectUpdate: (project: ProjectInterface) => {
    dispatchAction(ProjectUpdateActions.clearProjectUpdates({ project }))
  },
  setSourceURL: (project: ProjectInterface, sourceURL: string) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'sourceURL', value: sourceURL }))
  },
  setDestinationURL: (project: ProjectInterface, destinationURL: string) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'destinationURL', value: destinationURL })
    )
  },
  setBranchProcessing: (project: ProjectInterface, processing: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'branchProcessing', value: processing })
    )
  },
  setDestinationProcessing: (project: ProjectInterface, processing: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'destinationProcessing', value: processing })
    )
  },
  setSourceValid: (project: ProjectInterface, valid: boolean) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'sourceValid', value: valid }))
  },
  setDestinationValid: (project: ProjectInterface, valid: boolean) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'destinationValid', value: valid }))
  },
  setDestinationError: (project: ProjectInterface, error: string) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'destinationError', value: error }))
  },
  setTagsProcessing: (project: ProjectInterface, processing: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'tagsProcessing', value: processing })
    )
  },
  setSourceURLError: (project: ProjectInterface, error: string) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'sourceURLError', value: error }))
  },
  setBranchError: (project: ProjectInterface, error: string) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'branchError', value: error }))
  },
  setTagError: (project: ProjectInterface, error: string) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'tagError', value: error }))
  },
  setShowBranchSelector: (project: ProjectInterface, show: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'showBranchSelector', value: show })
    )
  },
  setShowTagSelector: (project: ProjectInterface, show: boolean) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'showTagSelector', value: show }))
  },
  setBranchData: (project: ProjectInterface, data: ProjectBranchInterface[]) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'branchData', value: data }))
  },
  setTagData: (project: ProjectInterface, data: ProjectTagInterface[]) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'tagData', value: data }))
  },
  setSelectedBranch: (project: ProjectInterface, branchName: string) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'selectedBranch', value: branchName })
    )
  },
  setSourceVsDestinationProcessing: (project: ProjectInterface, processing: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({
        project,
        fieldName: 'sourceVsDestinationProcessing',
        value: processing
      })
    )
  },
  setSourceVsDestinationError: (project: ProjectInterface, error: string) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'sourceVsDestinationError', value: error })
    )
  },
  setSourceVsDestinationChecked: (project: ProjectInterface, checked: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'sourceVsDestinationChecked', value: checked })
    )
  },
  setSourceProjectMatchesDestination: (project: ProjectInterface, matches: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({
        project,
        fieldName: 'sourceProjectMatchesDestination',
        value: matches
      })
    )
  },
  setDestinationProjectName: (project: ProjectInterface, projectName: string) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'destinationProjectName', value: projectName })
    )
  },
  setDestinationRepoEmpty: (project: ProjectInterface, empty: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'destinationRepoEmpty', value: empty })
    )
  },
  setSourceProjectName: (project: ProjectInterface, projectName: string) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'sourceProjectName', value: projectName })
    )
  },
  setSelectedSHA: (project: ProjectInterface, commitSHA: string) => {
    dispatchAction(ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'selectedSHA', value: commitSHA }))
  },
  setSubmitDisabled: (project: ProjectInterface, disabled: boolean) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'submitDisabled', value: disabled })
    )
  },
  setProjectName: (project: ProjectInterface, projectName: string) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'projectName', value: projectName })
    )
  },
  setTriggerSetDestination: (project: ProjectInterface, trigger: string) => {
    dispatchAction(
      ProjectUpdateActions.setProjectUpdateField({ project, fieldName: 'triggerSetDestination', value: trigger })
    )
  },

  resetSourceState: (project: ProjectInterface, { resetSourceURL = true, resetBranch = true }) => {
    if (resetSourceURL) ProjectUpdateService.setSourceURL(project, '')
    if (resetBranch) {
      ProjectUpdateService.setSelectedBranch(project, '')
      ProjectUpdateService.setBranchData(project, [])
      ProjectUpdateService.setShowBranchSelector(project, false)
    }
    ProjectUpdateService.setSelectedSHA(project, '')
    ProjectUpdateService.setTagData(project, [])
    ProjectUpdateService.setShowTagSelector(project, false)
    ProjectUpdateService.setSubmitDisabled(project, true)
    ProjectUpdateService.setSourceURLError(project, '')
    ProjectUpdateService.setBranchError(project, '')
    ProjectUpdateService.setTagError(project, '')
    ProjectUpdateService.setSourceValid(project, false)
    ProjectUpdateService.setSourceProjectName(project, '')
    ProjectUpdateService.setSourceProjectMatchesDestination(project, false)
    ProjectUpdateService.setSourceVsDestinationError(project, '')
  },

  resetDestinationState: (project: ProjectInterface, { resetDestinationURL = true }) => {
    ProjectUpdateService.setSubmitDisabled(project, true)
    if (resetDestinationURL) ProjectUpdateService.setDestinationURL(project, '')
    ProjectUpdateService.setDestinationValid(project, false)
    ProjectUpdateService.setDestinationError(project, '')
    ProjectUpdateService.setSourceProjectMatchesDestination(project, false)
    ProjectUpdateService.setDestinationProjectName(project, '')
    ProjectUpdateService.setDestinationRepoEmpty(project, false)
    ProjectUpdateService.setSourceVsDestinationError(project, '')
    ProjectUpdateService.setTriggerSetDestination(project, '')
  }
}

export class ProjectUpdateActions {
  static clearProjectUpdates = defineAction({
    type: 'xre.client.ProjectUpdate.CLEAR_PROJECT_UPDATE' as const,
    project: matches.object as Validator<unknown, ProjectInterface>
  })

  static initializeProjectUpdate = defineAction({
    type: 'xre.client.ProjectUpdate.INITIALIZE_PROJECT_UPDATE' as const,
    project: matches.object as Validator<unknown, ProjectInterface>
  })

  static setProjectUpdateField = defineAction({
    type: 'xre.client.ProjectUpdate.SET_PROJECT_UPDATE_FIELD' as const,
    project: matches.object as Validator<unknown, ProjectInterface>,
    fieldName: matches.string,
    value: matches.any
  })
}
