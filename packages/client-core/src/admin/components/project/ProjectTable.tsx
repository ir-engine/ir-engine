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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { GrGithub } from 'react-icons/gr'
import {
  HiOutlineArrowPath,
  HiOutlineCommandLine,
  HiOutlineExclamationCircle,
  HiOutlineFolder,
  HiOutlineTrash,
  HiOutlineUsers
} from 'react-icons/hi2'

import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { ProjectService } from '@etherealengine/client-core/src/common/services/ProjectService'
import config from '@etherealengine/common/src/config'
import multiLogger from '@etherealengine/common/src/logger'
import { projectPath, ProjectType } from '@etherealengine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind, useSearch } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import ConfirmDialog from '@etherealengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import CopyText from '@etherealengine/ui/src/primitives/tailwind/CopyText'
import Toggle from '@etherealengine/ui/src/primitives/tailwind/Toggle'
import Tooltip from '@etherealengine/ui/src/primitives/tailwind/Tooltip'

import { toDisplayDateTime } from '@etherealengine/common/src/utils/datetime-sql'
import { ProjectRowType, projectsColumns } from '../../common/constants/project'
import DataTable from '../../common/Table'
import { ProjectUpdateState } from '../../services/ProjectUpdateService'
import AddEditProjectModal from './AddEditProjectModal'
import ManageUserPermissionModal from './ManageUserPermissionModal'

const logger = multiLogger.child({ component: 'client-core:ProjectTable' })

export default function ProjectTable(props: { search: string }) {
  const { t } = useTranslation()
  const activeProjectId = useHookstate<string | null>(null)
  const projectQuery = useFind(projectPath, {
    query: {
      allowed: true,
      $limit: 20,
      action: 'admin',
      $sort: {
        name: 1
      }
    }
  })

  useSearch(
    projectQuery,
    {
      $or: [
        {
          name: {
            $like: `%${props.search}%`
          }
        }
      ]
    },
    props.search
  )

  const handleEnabledChange = async (project: ProjectType) => {
    await ProjectService.setEnabled(project.id, !project.enabled)
    projectQuery.refetch()
  }

  const RowActions = ({ project }: { project: ProjectType }) => {
    const handleProjectUpdate = async () => {
      const projectUpdateStatus = getMutableState(ProjectUpdateState)[project.name].value
      await ProjectService.uploadProject({
        sourceURL: projectUpdateStatus.sourceURL,
        destinationURL: projectUpdateStatus.destinationURL,
        name: project.name,
        reset: true,
        commitSHA: projectUpdateStatus.selectedSHA,
        sourceBranch: projectUpdateStatus.selectedBranch,
        updateType: projectUpdateStatus.updateType,
        updateSchedule: projectUpdateStatus.updateSchedule
      }).catch((err) => {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      })
      PopoverState.hidePopupover()
    }

    return (
      <div className="flex items-center justify-evenly p-1">
        <Button
          startIcon={<HiOutlineArrowPath />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          disabled={project.name === '@etherealengine/default-project'}
          onClick={() =>
            PopoverState.showPopupover(
              <AddEditProjectModal update={true} inputProject={project} onSubmit={handleProjectUpdate} />
            )
          }
        >
          {t('admin:components.project.actions.update')}
        </Button>
        <Button
          startIcon={<GrGithub />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          disabled={!project || !project.repositoryPath || project.name === '@etherealengine/default-project'}
          onClick={() => {
            PopoverState.showPopupover(
              <ConfirmDialog
                text={`${t('admin:components.project.confirmPushProjectToGithub')}? ${project.name} - ${
                  project.repositoryPath
                }`}
                onSubmit={async () => {
                  await ProjectService.pushProject(project.id)
                }}
              />
            )
          }}
        >
          {t('admin:components.project.actions.push')}
        </Button>

        <Button
          startIcon={<HiOutlineUsers />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          onClick={() => {
            activeProjectId.set(project.id)
            PopoverState.showPopupover(<ManageUserPermissionModal project={project} />)
          }}
        >
          {t('admin:components.project.actions.access')}
        </Button>
        <Button
          startIcon={<HiOutlineCommandLine />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          disabled={config.client.localBuildOrDev}
          onClick={() => {
            PopoverState.showPopupover(
              <ConfirmDialog
                text={`${t('admin:components.project.confirmProjectInvalidate')} '${project.name}'?`}
                onSubmit={async () => {
                  await ProjectService.invalidateProjectCache(project.name)
                }}
              />
            )
          }}
        >
          {t('admin:components.project.actions.invalidateCache')}
        </Button>
        <Button
          startIcon={<HiOutlineFolder />}
          size="small"
          className="mr-2 h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
        >
          {t('admin:components.common.view')}
        </Button>
        <Button
          startIcon={<HiOutlineTrash />}
          size="small"
          className="h-min whitespace-pre bg-theme-blue-secondary text-[#214AA6] disabled:opacity-50 dark:text-white"
          disabled={project.name === '@etherealengine/default-project'}
          onClick={() => {
            PopoverState.showPopupover(
              <ConfirmDialog
                text={`${t('admin:components.project.confirmProjectDelete')} '${project.name}'?`}
                onSubmit={async () => {
                  await ProjectService.removeProject(project.id).catch((err) => logger.error(err))
                }}
              />
            )
          }}
        >
          {t('admin:components.common.remove')}
        </Button>
      </div>
    )
  }

  const createRows = (rows: readonly ProjectType[]): ProjectRowType[] =>
    rows.map((row) => {
      return {
        name: (
          <div className="flex items-center gap-2">
            <a
              target="_blank"
              href={`/studio?project=${row.name}`}
              className={row.needsRebuild ? 'text-blue-400' : 'text-theme-primary'}
            >
              {row.name}
            </a>
            {!!row.needsRebuild && (
              <Tooltip title={t('admin:components.project.outdatedBuild')} position="right center">
                <HiOutlineExclamationCircle className="text-orange-400" size={22} />
              </Tooltip>
            )}
            {!!row.hasLocalChanges && (
              <Tooltip title={t('admin:components.project.hasLocalChanges')} position="right center">
                <HiOutlineExclamationCircle className="text-yellow-400" size={22} />
              </Tooltip>
            )}
          </div>
        ),
        projectVersion: row.version,
        enabled: (
          <Toggle
            disabled={row.name === '@etherealengine/default-project'}
            value={row.enabled}
            onChange={() => handleEnabledChange(row)}
          />
        ),
        commitSHA: (
          <span className="flex items-center justify-between">
            <Tooltip title={row.commitSHA || ''}>
              <>{row.commitSHA?.slice(0, 8)}</>
            </Tooltip>{' '}
            <CopyText text={row.commitSHA || ''} className="ml-1" />
          </span>
        ),
        commitDate: toDisplayDateTime(row.commitDate),
        actions: <RowActions project={row} />
      }
    })

  return <DataTable query={projectQuery} columns={projectsColumns} rows={createRows(projectQuery.data)} />
}
