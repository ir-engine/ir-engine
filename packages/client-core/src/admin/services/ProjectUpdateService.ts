/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { none } from '@hookstate/core'

import { DefaultUpdateSchedule } from '@etherealengine/common/src/interfaces/ProjectPackageJsonType'
import { ProjectBranchType } from '@etherealengine/engine/src/schemas/projects/project-branches.schema'
import { ProjectCommitType } from '@etherealengine/engine/src/schemas/projects/project-commits.schema'
import { ProjectType } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

type ProjectUpdateStateType = {
  branchProcessing: boolean
  destinationProcessing: boolean
  sourceURL: string
  destinationURL: string
  destinationValid: boolean
  destinationError: string
  sourceValid: boolean
  commitsProcessing: boolean
  sourceURLError: string
  branchError: string
  commitError: string
  showBranchSelector: boolean
  showCommitSelector: boolean
  branchData: ProjectBranchType[]
  commitData: ProjectCommitType[]
  selectedBranch: string
  sourceVsDestinationProcessing: boolean
  sourceVsDestinationError: string
  sourceProjectMatchesDestination: boolean
  destinationProjectName: string
  destinationRepoEmpty: boolean
  sourceProjectName: string
  sourceVsDestinationChecked: boolean
  selectedSHA: string
  projectName: string
  submitDisabled: true
  triggerSetDestination: string
  updateType: ProjectType['updateType']
  updateSchedule: typeof DefaultUpdateSchedule
}

export const ProjectUpdateState = defineState({
  name: 'ProjectUpdateState',
  initial: () => ({}) as any as Record<string, ProjectUpdateStateType>
})

const updateProjectField = ({
  projectName,
  fieldName,
  value
}: {
  projectName: string
  fieldName: string
  value: any
}) => {
  const state = getMutableState(ProjectUpdateState)
  if (state[projectName] && state[projectName][fieldName]) state[projectName][fieldName].set(value)
}

export const ProjectUpdateService = {
  initializeProjectUpdate: (projectName: string) => {
    getMutableState(ProjectUpdateState)[projectName].set({
      branchProcessing: false,
      destinationProcessing: false,
      sourceURL: '',
      destinationURL: '',
      destinationValid: false,
      destinationError: '',
      sourceValid: false,
      commitsProcessing: false,
      sourceURLError: '',
      branchError: '',
      commitError: '',
      showBranchSelector: false,
      showCommitSelector: false,
      branchData: [],
      commitData: [],
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
      triggerSetDestination: '',
      updateType: 'none' as ProjectType['updateType'],
      updateSchedule: DefaultUpdateSchedule
    })
  },
  clearProjectUpdate: (projectName: string) => {
    getMutableState(ProjectUpdateState)[projectName].set(none)
  },
  setSourceURL: (projectName: string, sourceURL: string) => {
    updateProjectField({ projectName, fieldName: 'sourceURL', value: sourceURL })
  },
  setDestinationURL: (projectName: string, destinationURL: string) => {
    updateProjectField({ projectName, fieldName: 'destinationURL', value: destinationURL })
  },
  setBranchProcessing: (projectName: string, processing: boolean) => {
    updateProjectField({ projectName, fieldName: 'branchProcessing', value: processing })
  },
  setDestinationProcessing: (projectName: string, processing: boolean) => {
    updateProjectField({ projectName, fieldName: 'destinationProcessing', value: processing })
  },
  setSourceValid: (projectName: string, valid: boolean) => {
    updateProjectField({ projectName, fieldName: 'sourceValid', value: valid })
  },
  setDestinationValid: (projectName: string, valid: boolean) => {
    updateProjectField({ projectName, fieldName: 'destinationValid', value: valid })
  },
  setDestinationError: (projectName: string, error: string) => {
    updateProjectField({ projectName, fieldName: 'destinationError', value: error })
  },
  setCommitsProcessing: (projectName: string, processing: boolean) => {
    updateProjectField({ projectName, fieldName: 'commitsProcessing', value: processing })
  },
  setSourceURLError: (projectName: string, error: string) => {
    updateProjectField({ projectName, fieldName: 'sourceURLError', value: error })
  },
  setBranchError: (projectName: string, error: string) => {
    updateProjectField({ projectName, fieldName: 'branchError', value: error })
  },
  setCommitError: (projectName: string, error: string) => {
    updateProjectField({ projectName, fieldName: 'commitError', value: error })
  },
  setShowBranchSelector: (projectName: string, show: boolean) => {
    updateProjectField({ projectName, fieldName: 'showBranchSelector', value: show })
  },
  setShowCommitSelector: (projectName: string, show: boolean) => {
    updateProjectField({ projectName, fieldName: 'showCommitSelector', value: show })
  },
  setBranchData: (projectName: string, data: ProjectBranchType[]) => {
    updateProjectField({ projectName, fieldName: 'branchData', value: data })
  },
  setCommitData: (projectName: string, data: ProjectCommitType[]) => {
    updateProjectField({ projectName, fieldName: 'commitData', value: data })
  },
  mergeCommitData: (projectName: string, data: ProjectCommitType) => {
    const state = getMutableState(ProjectUpdateState)
    if (state[projectName] && state[projectName]['commitData']) {
      const field = state[projectName]['commitData']
      const matchIndex = field.value!.findIndex((fieldItem) => {
        return fieldItem != null && fieldItem['commitSHA'] === data['commitSHA']
      })
      if (matchIndex !== -1) return field[matchIndex].set(data)
      else return field.merge([data])
    }
  },
  setSelectedBranch: (projectName: string, branchName: string) => {
    updateProjectField({ projectName, fieldName: 'selectedBranch', value: branchName })
  },
  setSourceVsDestinationProcessing: (projectName: string, processing: boolean) => {
    updateProjectField({
      projectName,
      fieldName: 'sourceVsDestinationProcessing',
      value: processing
    })
  },
  setSourceVsDestinationError: (projectName: string, error: string) => {
    updateProjectField({ projectName, fieldName: 'sourceVsDestinationError', value: error })
  },
  setSourceVsDestinationChecked: (projectName: string, checked: boolean) => {
    updateProjectField({ projectName, fieldName: 'sourceVsDestinationChecked', value: checked })
  },
  setSourceProjectMatchesDestination: (projectName: string, matches: boolean) => {
    updateProjectField({
      projectName,
      fieldName: 'sourceProjectMatchesDestination',
      value: matches
    })
  },
  setDestinationProjectName: (projectName: string, destinationProjectName: string) => {
    updateProjectField({ projectName, fieldName: 'destinationProjectName', value: destinationProjectName })
  },
  setDestinationRepoEmpty: (projectName: string, empty: boolean) => {
    updateProjectField({ projectName, fieldName: 'destinationRepoEmpty', value: empty })
  },
  setSourceProjectName: (projectName: string, sourceProjectName: string) => {
    updateProjectField({ projectName, fieldName: 'sourceProjectName', value: sourceProjectName })
  },
  setSelectedSHA: (projectName: string, commitSHA: string) => {
    updateProjectField({ projectName, fieldName: 'selectedSHA', value: commitSHA })
  },
  setSubmitDisabled: (projectName: string, disabled: boolean) => {
    updateProjectField({ projectName, fieldName: 'submitDisabled', value: disabled })
  },
  setProjectName: (projectName: string, projectNameField: string) => {
    updateProjectField({ projectName, fieldName: 'projectName', value: projectNameField })
  },
  setTriggerSetDestination: (
    projectName: string,
    trigger: string,
    type?: ProjectType['updateType'],
    schedule?: string
  ) => {
    ProjectUpdateService.setUpdateType(projectName, type || 'none')
    ProjectUpdateService.setUpdateSchedule(projectName, schedule || DefaultUpdateSchedule)

    updateProjectField({ projectName, fieldName: 'triggerSetDestination', value: trigger })
  },
  setUpdateType: (projectName: string, type: ProjectType['updateType']) => {
    updateProjectField({ projectName, fieldName: 'updateType', value: type })
  },
  setUpdateSchedule: (projectName: string, schedule: string) => {
    updateProjectField({ projectName, fieldName: 'updateSchedule', value: schedule })
  },

  resetSourceState: (projectName: string, { resetSourceURL = true, resetBranch = true }) => {
    if (resetSourceURL) ProjectUpdateService.setSourceURL(projectName, '')
    if (resetBranch) {
      ProjectUpdateService.setSelectedBranch(projectName, '')
      ProjectUpdateService.setBranchData(projectName, [])
      ProjectUpdateService.setShowBranchSelector(projectName, false)
    }
    ProjectUpdateService.setSelectedSHA(projectName, '')
    ProjectUpdateService.setCommitData(projectName, [])
    ProjectUpdateService.setShowCommitSelector(projectName, false)
    ProjectUpdateService.setSubmitDisabled(projectName, true)
    ProjectUpdateService.setSourceURLError(projectName, '')
    ProjectUpdateService.setBranchError(projectName, '')
    ProjectUpdateService.setCommitError(projectName, '')
    ProjectUpdateService.setSourceValid(projectName, false)
    ProjectUpdateService.setSourceProjectName(projectName, '')
    ProjectUpdateService.setSourceProjectMatchesDestination(projectName, false)
    ProjectUpdateService.setSourceVsDestinationError(projectName, '')
  },

  resetDestinationState: (projectName: string, { resetDestinationURL = true }) => {
    ProjectUpdateService.setSubmitDisabled(projectName, true)
    if (resetDestinationURL) ProjectUpdateService.setDestinationURL(projectName, '')
    ProjectUpdateService.setDestinationValid(projectName, false)
    ProjectUpdateService.setDestinationError(projectName, '')
    ProjectUpdateService.setSourceProjectMatchesDestination(projectName, false)
    ProjectUpdateService.setDestinationProjectName(projectName, '')
    ProjectUpdateService.setDestinationRepoEmpty(projectName, false)
    ProjectUpdateService.setSourceVsDestinationError(projectName, '')
    ProjectUpdateService.setTriggerSetDestination(projectName, '')
  }
}
