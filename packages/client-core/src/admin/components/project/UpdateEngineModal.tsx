/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LuInfo } from 'react-icons/lu'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { ProjectService, ProjectState } from '@ir-engine/client-core/src/common/services/ProjectService'
import { useFind } from '@ir-engine/common'
import { DefaultUpdateSchedule } from '@ir-engine/common/src/interfaces/ProjectPackageJsonType'
import { ProjectType, ScopeType, engineSettingPath, scopePath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Select from '@ir-engine/ui/src/primitives/tailwind/Select'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { Engine } from '@ir-engine/ecs'
import { AuthState } from '../../../user/services/AuthService'
import { ProjectUpdateService, ProjectUpdateState } from '../../services/ProjectUpdateService'
import AddEditProjectModal from './AddEditProjectModal'

const getDefaultErrors = () => ({
  serverError: ''
})

export default function UpdateEngineModal() {
  const { t } = useTranslation()
  const helmSettings = useFind(engineSettingPath, {
    query: {
      category: 'helm',
      paginate: false
    }
  }).data

  const helmBuilder = helmSettings.find((setting) => setting.key == EngineSettings.Helm.Main)?.value
  const helmMain = helmSettings.find((setting) => setting.key === EngineSettings.Helm.Builder)?.value
  const projectState = useMutableState(ProjectState)
  const projectUpdateStatus = useMutableState(ProjectUpdateState)
  const engineCommit = projectState.builderInfo.engineCommit.value

  const updateProjects = useHookstate(false)
  const selectedCommitTag = useHookstate('')
  const modalProcessing = useHookstate(false)
  const projectsToUpdate = useHookstate(new Set<string>())
  const errors = useHookstate(getDefaultErrors())
  const authState = useMutableState(AuthState)
  const user = authState.user

  const scopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.store.userID,
      type: 'projects:read' as ScopeType
    }
  })

  useEffect(() => {
    if (scopeQuery.data.length > 0) {
      ProjectService.fetchBuilderTags()
      ProjectService.getBuilderInfo()
    }
  }, [scopeQuery.data.length > 0])

  const selectCommitTagOptions = projectState.builderTags.value.map((builderTag) => {
    const pushedDate = toDisplayDateTime(builderTag.pushedAt)
    return {
      value: builderTag.tag,
      label: `Commit ${builderTag.commitSHA?.slice(0, 8)} -- ${
        builderTag.tag === engineCommit ? '(Current) ' : ''
      }Version ${builderTag.engineVersion} -- Pushed ${pushedDate}`
    }
  })

  const addOrRemoveProjectsToUpdate = (project: ProjectType, value: boolean) => {
    if (value) {
      ProjectUpdateService.initializeProjectUpdate(project.name)
      ProjectUpdateService.setTriggerSetDestination(
        project.name,
        project.repositoryPath,
        project.updateType,
        project.updateSchedule
      )
      PopoverState.showPopupover(
        <AddEditProjectModal
          inputProject={project}
          update={true}
          onSubmit={async () => {
            projectsToUpdate.set((set) => {
              set.add(project.name)
              return set
            })
            PopoverState.hidePopupover()
          }}
        />
      )
    } else {
      ProjectUpdateService.clearProjectUpdate(project.name)
      projectsToUpdate.set((set) => {
        set.delete(project.name)
        return set
      })
    }
  }

  const handleSubmit = async () => {
    modalProcessing.set(true)
    errors.set(getDefaultErrors())
    try {
      await ProjectService.updateEngine(
        selectedCommitTag.value,
        updateProjects.value,
        Object.keys(projectUpdateStatus.value).map((name) => {
          return {
            name: projectUpdateStatus[name].projectName.value,
            sourceURL: projectUpdateStatus[name].sourceURL.value,
            destinationURL: projectUpdateStatus[name].destinationURL.value,
            reset: true,
            commitSHA: projectUpdateStatus[name].selectedSHA.value,
            sourceBranch: projectUpdateStatus[name].selectedBranch.value,
            updateType: projectUpdateStatus[name].updateType.value || ('none' as ProjectType['updateType']),
            updateSchedule: projectUpdateStatus[name].updateSchedule.value || DefaultUpdateSchedule
          }
        })
      )
      PopoverState.hidePopupover()
    } catch (err) {
      errors.set(err.message)
    }
    modalProcessing.set(false)
    PopoverState.hidePopupover()
  }

  useEffect(() => {
    if (engineCommit) selectedCommitTag.set(engineCommit)
  }, [engineCommit])

  return (
    <Modal
      title={t('admin:components.project.updateEngine')}
      onSubmit={handleSubmit}
      className="w-[50vw]"
      onClose={PopoverState.hidePopupover}
      submitLoading={modalProcessing.value}
    >
      <div className="grid gap-6">
        {errors.serverError.value && <p className="mb-3 text-red-700">{errors.serverError.value}</p>}
        <Text>
          {t('admin:components.setting.helm.mainHelmToDeploy')}:{' '}
          <a href="/admin/settings#helm">{helmMain || 'Current Version'}</a>
        </Text>
        <Text>
          {t('admin:components.setting.helm.builderHelmToDeploy')}:{' '}
          <a href="/admin/settings#helm">{helmBuilder || 'Current Version'}</a>
        </Text>
        <Select
          labelProps={{
            text: t('admin:components.project.commitData'),
            position: 'top'
          }}
          options={selectCommitTagOptions}
          value={selectedCommitTag.value}
          onChange={(value: string) => {
            selectedCommitTag.set(value)
          }}
          disabled={modalProcessing.value}
        />
        <Checkbox
          checked={updateProjects.value}
          onChange={updateProjects.set}
          label={t('admin:components.project.updateSelector')}
          disabled={modalProcessing.value}
        />

        {updateProjects.value && (
          <>
            <div className="flex items-center justify-center gap-3 rounded-lg bg-theme-bannerInformative p-4">
              <div>
                <LuInfo className="h-5 w-5 bg-transparent" />
              </div>
              <Text>{t('admin:components.project.projectWarning')}</Text>
            </div>
            <div className="grid gap-2">
              {projectState.projects.value
                .filter((project) => project.name !== 'ir-engine/default-project' && project.repositoryPath)
                .map((project) => (
                  <div key={project.id} className="border border-theme-primary bg-theme-surfaceInput px-3.5 py-5">
                    <Checkbox
                      label={project.name}
                      checked={projectsToUpdate.value.has(project.name)}
                      disabled={modalProcessing.value}
                      onChange={(value) => addOrRemoveProjectsToUpdate(project as ProjectType, value)}
                    />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
