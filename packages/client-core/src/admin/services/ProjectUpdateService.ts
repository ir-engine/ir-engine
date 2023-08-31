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

import { ProjectBranchInterface } from '@etherealengine/common/src/interfaces/ProjectBranchInterface'
import { ProjectCommitInterface } from '@etherealengine/common/src/interfaces/ProjectCommitInterface'
import { DefaultUpdateSchedule } from '@etherealengine/common/src/interfaces/ProjectPackageJsonType'
import { ProjectType } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

export const ProjectUpdateState = defineState({
  name: 'ProjectUpdateState',
  initial: () => ({})
})

const updateProjectField = ({ project, fieldName, value }: { project: ProjectType; fieldName: string; value: any }) => {
  const state = getMutableState(ProjectUpdateState)
  if (state[project.name] && state[project.name][fieldName]) state[project.name][fieldName].set(value)
}

export const ProjectUpdateService = {
  initializeProjectUpdate: (project: ProjectType) => {
    getMutableState(ProjectUpdateState)[project.name].set({
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
  clearProjectUpdate: (project: ProjectType) => {
    getMutableState(ProjectUpdateState)[project.name].set(none)
  },
  setSourceURL: (project: ProjectType, sourceURL: string) => {
    updateProjectField({ project, fieldName: 'sourceURL', value: sourceURL })
  },
  setDestinationURL: (project: ProjectType, destinationURL: string) => {
    updateProjectField({ project, fieldName: 'destinationURL', value: destinationURL })
  },
  setBranchProcessing: (project: ProjectType, processing: boolean) => {
    updateProjectField({ project, fieldName: 'branchProcessing', value: processing })
  },
  setDestinationProcessing: (project: ProjectType, processing: boolean) => {
    updateProjectField({ project, fieldName: 'destinationProcessing', value: processing })
  },
  setSourceValid: (project: ProjectType, valid: boolean) => {
    updateProjectField({ project, fieldName: 'sourceValid', value: valid })
  },
  setDestinationValid: (project: ProjectType, valid: boolean) => {
    updateProjectField({ project, fieldName: 'destinationValid', value: valid })
  },
  setDestinationError: (project: ProjectType, error: string) => {
    updateProjectField({ project, fieldName: 'destinationError', value: error })
  },
  setCommitsProcessing: (project: ProjectType, processing: boolean) => {
    updateProjectField({ project, fieldName: 'commitsProcessing', value: processing })
  },
  setSourceURLError: (project: ProjectType, error: string) => {
    updateProjectField({ project, fieldName: 'sourceURLError', value: error })
  },
  setBranchError: (project: ProjectType, error: string) => {
    updateProjectField({ project, fieldName: 'branchError', value: error })
  },
  setCommitError: (project: ProjectType, error: string) => {
    updateProjectField({ project, fieldName: 'commitError', value: error })
  },
  setShowBranchSelector: (project: ProjectType, show: boolean) => {
    updateProjectField({ project, fieldName: 'showBranchSelector', value: show })
  },
  setShowCommitSelector: (project: ProjectType, show: boolean) => {
    updateProjectField({ project, fieldName: 'showCommitSelector', value: show })
  },
  setBranchData: (project: ProjectType, data: ProjectBranchInterface[]) => {
    updateProjectField({ project, fieldName: 'branchData', value: data })
  },
  setCommitData: (project: ProjectType, data: ProjectCommitInterface[]) => {
    updateProjectField({ project, fieldName: 'commitData', value: data })
  },
  mergeCommitData: (project: ProjectType, data: ProjectCommitInterface) => {
    const state = getMutableState(ProjectUpdateState)
    if (state[project.name] && state[project.name]['commitData']) {
      const field = state[project.name]['commitData']
      const matchIndex = field.value!.findIndex((fieldItem) => {
        return fieldItem != null && fieldItem['commitSHA'] === data['commitSHA']
      })
      if (matchIndex !== -1) return field[matchIndex].set(data)
      else return field.merge([data])
    }
  },
  setSelectedBranch: (project: ProjectType, branchName: string) => {
    updateProjectField({ project, fieldName: 'selectedBranch', value: branchName })
  },
  setSourceVsDestinationProcessing: (project: ProjectType, processing: boolean) => {
    updateProjectField({
      project,
      fieldName: 'sourceVsDestinationProcessing',
      value: processing
    })
  },
  setSourceVsDestinationError: (project: ProjectType, error: string) => {
    updateProjectField({ project, fieldName: 'sourceVsDestinationError', value: error })
  },
  setSourceVsDestinationChecked: (project: ProjectType, checked: boolean) => {
    updateProjectField({ project, fieldName: 'sourceVsDestinationChecked', value: checked })
  },
  setSourceProjectMatchesDestination: (project: ProjectType, matches: boolean) => {
    updateProjectField({
      project,
      fieldName: 'sourceProjectMatchesDestination',
      value: matches
    })
  },
  setDestinationProjectName: (project: ProjectType, projectName: string) => {
    updateProjectField({ project, fieldName: 'destinationProjectName', value: projectName })
  },
  setDestinationRepoEmpty: (project: ProjectType, empty: boolean) => {
    updateProjectField({ project, fieldName: 'destinationRepoEmpty', value: empty })
  },
  setSourceProjectName: (project: ProjectType, projectName: string) => {
    updateProjectField({ project, fieldName: 'sourceProjectName', value: projectName })
  },
  setSelectedSHA: (project: ProjectType, commitSHA: string) => {
    updateProjectField({ project, fieldName: 'selectedSHA', value: commitSHA })
  },
  setSubmitDisabled: (project: ProjectType, disabled: boolean) => {
    updateProjectField({ project, fieldName: 'submitDisabled', value: disabled })
  },
  setProjectName: (project: ProjectType, projectName: string) => {
    updateProjectField({ project, fieldName: 'projectName', value: projectName })
  },
  setTriggerSetDestination: (project: ProjectType, trigger: string) => {
    ProjectUpdateService.setUpdateType(project, project.updateType || 'none')
    ProjectUpdateService.setUpdateSchedule(project, project.updateSchedule || DefaultUpdateSchedule)

    updateProjectField({ project, fieldName: 'triggerSetDestination', value: trigger })
  },
  setUpdateType: (project: ProjectType, type: ProjectType['updateType']) => {
    updateProjectField({ project, fieldName: 'updateType', value: type })
  },
  setUpdateSchedule: (project: ProjectType, schedule: string) => {
    updateProjectField({ project, fieldName: 'updateSchedule', value: schedule })
  },

  resetSourceState: (project: ProjectType, { resetSourceURL = true, resetBranch = true }) => {
    if (resetSourceURL) ProjectUpdateService.setSourceURL(project, '')
    if (resetBranch) {
      ProjectUpdateService.setSelectedBranch(project, '')
      ProjectUpdateService.setBranchData(project, [])
      ProjectUpdateService.setShowBranchSelector(project, false)
    }
    ProjectUpdateService.setSelectedSHA(project, '')
    ProjectUpdateService.setCommitData(project, [])
    ProjectUpdateService.setShowCommitSelector(project, false)
    ProjectUpdateService.setSubmitDisabled(project, true)
    ProjectUpdateService.setSourceURLError(project, '')
    ProjectUpdateService.setBranchError(project, '')
    ProjectUpdateService.setCommitError(project, '')
    ProjectUpdateService.setSourceValid(project, false)
    ProjectUpdateService.setSourceProjectName(project, '')
    ProjectUpdateService.setSourceProjectMatchesDestination(project, false)
    ProjectUpdateService.setSourceVsDestinationError(project, '')
  },

  resetDestinationState: (project: ProjectType, { resetDestinationURL = true }) => {
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
