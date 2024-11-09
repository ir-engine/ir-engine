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
import { HiArrowPath, HiPlus } from 'react-icons/hi2'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { ProjectService, ProjectState } from '@ir-engine/client-core/src/common/services/ProjectService'
import config from '@ir-engine/common/src/config'
import { NO_PROXY, getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import { useFind } from '@ir-engine/common'
import { identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import { ProjectUpdateState } from '../../services/ProjectUpdateService'
import AddEditProjectModal from './AddEditProjectModal'
import UpdateEngineModal from './UpdateEngineModal'

export default function ProjectTopMenu() {
  const { t } = useTranslation()
  const projectState = useMutableState(ProjectState)
  const modalProcessing = useHookstate(false)

  ProjectService.useAPIListeners()

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    if (projectState.rebuilding.value) {
      interval = setInterval(ProjectService.checkReloadStatus, 10000)
    } else {
      if (interval) clearInterval(interval)
      ProjectService.fetchProjects()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [projectState.rebuilding.value])

  const handleSubmit = async () => {
    const projectUpdateStatus = getMutableState(ProjectUpdateState)['tempProject'].get(NO_PROXY)
    try {
      await ProjectService.uploadProject({
        sourceURL: projectUpdateStatus.sourceURL,
        destinationURL: projectUpdateStatus.destinationURL,
        name: projectUpdateStatus.projectName,
        reset: true,
        commitSHA: projectUpdateStatus.selectedSHA,
        sourceBranch: projectUpdateStatus.selectedBranch,
        updateType: projectUpdateStatus.updateType,
        updateSchedule: projectUpdateStatus.updateSchedule
      })
      PopoverState.hidePopupover()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }

  const identityProvidersQuery = useFind(identityProviderPath)
  const githubProvider = identityProvidersQuery.data.find((ip) => ip.type === 'github')

  const refreshGithubRepoAccess = () => {
    ProjectService.refreshGithubRepoAccess()
  }

  return (
    <div className="mb-4 flex justify-between gap-2">
      <div className="flex gap-2">
        {githubProvider != null && (
          <Button
            size="small"
            disabled={projectState.refreshingGithubRepoAccess.value}
            onClick={() => refreshGithubRepoAccess()}
            className="[&>*]:m-0"
          >
            {projectState.refreshingGithubRepoAccess.value ? (
              <span className="flex items-center gap-2">
                <LoadingView spinnerOnly className="inline-block h-6 w-6" />
                {t('admin:components.project.refreshingGithubRepoAccess')}
              </span>
            ) : (
              t('admin:components.project.refreshGithubRepoAccess')
            )}
          </Button>
        )}

        <Button
          startIcon={<HiArrowPath />}
          size="small"
          onClick={() => {
            PopoverState.showPopupover(<UpdateEngineModal />)
          }}
          disabled={config.client.localBuildOrDev}
          endIcon={
            !config.client.localBuildOrDev && projectState.rebuilding.value ? (
              <LoadingView spinnerOnly className="h-6 w-6" />
            ) : undefined
          }
        >
          {!config.client.localBuildOrDev && projectState.rebuilding.value
            ? t('admin:components.project.rebuilding')
            : t('admin:components.project.updateAndRebuild')}
        </Button>
        <Button
          startIcon={<HiPlus />}
          size="small"
          onClick={() => {
            PopoverState.showPopupover(<AddEditProjectModal onSubmit={handleSubmit} update={false} />)
          }}
        >
          {t('admin:components.project.addProject')}
        </Button>
      </div>
    </div>
  )
}
