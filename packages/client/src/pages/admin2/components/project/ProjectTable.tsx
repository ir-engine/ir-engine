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

import { ProjectType, projectPath } from '@etherealengine/common/src/schema.type.module'
import React from 'react'
import { IoFolderOutline, IoPeopleOutline, IoTerminalOutline } from 'react-icons/io5'
import { RiDeleteBinLine } from 'react-icons/ri'
import DataTable from '../../common/Table'
import { ProjectRowType, projectsColumns } from '../../common/constants/project'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { ProjectService } from '@etherealengine/client-core/src/common/services/ProjectService'
import multiLogger from '@etherealengine/common/src/logger'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import { useTranslation } from 'react-i18next'
import { GrEdit, GrGithub } from 'react-icons/gr'

const logger = multiLogger.child({ component: 'client-core:ProjectTable' })

export default function ProjectTable() {
  const { t } = useTranslation()
  const modalProcessing = useHookstate(false)
  const projectQuery = useFind(projectPath, {
    query: {
      allowed: true,
      $limit: 100,
      action: 'admin',
      $sort: {
        name: 1
      }
    }
  })

  const showConfirmDialog = (project: ProjectType, text: string, onSubmit: () => void) => {
    PopoverState.showPopupover(
      <Modal
        onSubmit={onSubmit}
        onClose={!modalProcessing.value ? () => PopoverState.hidePopupover() : undefined}
        hideFooter={modalProcessing.value}
      >
        {modalProcessing.value ? <LoadingCircle className="h-[10vh]" /> : <Text>{text}</Text>}
      </Modal>
    )
  }

  const createRows = (rows: readonly ProjectType[]): ProjectRowType[] =>
    rows.map((row) => ({
      name: (
        <a href={`/studio/${row.name}`} className={row.needsRebuild ? 'text-blue-400' : 'text-theme-primary'}>
          {row.name}
        </a>
      ),
      projectVersion: row.version,
      commitSHA: row.commitSHA,
      commitDate: row.commitDate
        ? new Date(row.commitDate).toLocaleString('en-us', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          })
        : '-',
      actions: (
        <div className="flex justify-evenly">
          <Button
            startIcon={<GrGithub />}
            size="small"
            className="bg-[#61759f] dark:bg-[#2A3753]"
            onClick={() => {
              showConfirmDialog(
                row,
                `${t('admin:components.project.confirmPushProjectToGithub')}? ${row.name} - ${row.repositoryPath}`,
                async () => {
                  if (!row || !row.repositoryPath || row.name === 'default-project') return

                  modalProcessing.set(true)
                  await ProjectService.pushProject(row.id).catch(() => modalProcessing.set(false))
                  modalProcessing.set(false)

                  PopoverState.hidePopupover()
                }
              )
            }}
          >
            {t('admin:components.project.actions.push')}
          </Button>
          <Button
            startIcon={<GrEdit />}
            size="small"
            className="bg-[#61759f] dark:bg-[#2A3753]"
            onClick={() => {
              PopoverState.showPopupover(<></>)
            }}
          >
            {t('admin:components.project.actions.update')}
          </Button>
          <Button
            startIcon={<IoPeopleOutline />}
            size="small"
            className="bg-[#61759f] dark:bg-[#2A3753]"
            onClick={() => {}}
          >
            {t('admin:components.project.actions.access')}
          </Button>
          <Button
            startIcon={<IoTerminalOutline />}
            size="small"
            className="bg-[#61759f] dark:bg-[#2A3753]"
            onClick={() => {
              showConfirmDialog(
                row,
                `${t('admin:components.project.confirmProjectInvalidate')} '${row.name}'?`,
                async () => {
                  modalProcessing.set(true)
                  await ProjectService.invalidateProjectCache(row.name)
                  PopoverState.hidePopupover()
                }
              )
            }}
          >
            {t('admin:components.project.actions.invalidateCache')}
          </Button>
          <Button startIcon={<IoFolderOutline />} size="small" className="bg-[#61759f] dark:bg-[#2A3753]">
            {t('admin:components.common.view')}
          </Button>
          <Button
            startIcon={<RiDeleteBinLine />}
            size="small"
            className="bg-[#61759f] dark:bg-[#2A3753]"
            onClick={() => {
              showConfirmDialog(
                row,
                `${t('admin:components.project.confirmProjectDelete')} '${row.name}'?`,
                async () => {
                  modalProcessing.set(true)
                  await ProjectService.removeProject(row.id).catch((err) => logger.error(err))
                  PopoverState.hidePopupover()
                }
              )
            }}
          >
            {t('admin:components.common.remove')}
          </Button>
        </div>
      )
    }))

  return <DataTable query={projectQuery} columns={projectsColumns} rows={createRows(projectQuery.data)} />
}
