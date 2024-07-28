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

import { useHookstate } from '@etherealengine/hyperflux'
import {
  projectHistoryPath,
  ProjectHistoryType
} from '@etherealengine/server-core/src/projects/project-history/project-history.schema'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import { TablePagination } from '@etherealengine/ui/src/primitives/tailwind/Table'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSortAmountDown, FaSortAmountUpAlt } from 'react-icons/fa'

const PROJECT_HISTORY_PAGE_LIMIT = 10

function HistoryLog({ projectHistory, projectName }: { projectHistory: ProjectHistoryType; projectName: string }) {
  const { t } = useTranslation()

  useEffect(() => {
    console.log('projectHistory: ', projectHistory)
  }, [projectHistory])

  const dateStr = useMemo(() => {
    const date = new Date(projectHistory.createdAt)

    const formattedDate = date
      .toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      .replace(',', ' at')
    return formattedDate
  }, [projectHistory.createdAt])

  // const assetURL = useMemo(() => {
  //   if (!projectHistory.assetURL) return projectHistory.assetURL
  //   const commonPrefix = `projects/${projectName}/`
  //   return projectHistory.assetURL.replace(commonPrefix, '')
  // }, [projectHistory.assetURL])

  return (
    <div className="flex w-full items-center justify-between rounded-lg bg-[#191B1F] px-5 py-2">
      {/* <div>
        <img
          className="inline-block h-14 w-14 rounded-full mr-2"
          src={avatar.data[0]?.thumbnailResource?.url || defaultThumbnail}
          alt="User Profile Picture"
        />

        <Text className="text-primary mr-4" fontWeight="normal" fontSize="base">
          {user.data?.name}
        </Text>

        <Text className="text-primary mr-2" fontWeight="normal" fontSize="base">
          {VERBS[projectHistory.updateMessage]}
        </Text>

        <Text className="text-primary" fontWeight="semibold" fontSize="base">
          {assetURL}
        </Text>
      </div> */}

      <Text className="text-primary mr-2" fontWeight="normal" fontSize="base">
        {dateStr}
      </Text>
    </div>
  )
}

export const ProjectHistory = ({ projectId, projectName }: { projectId: string; projectName: string }) => {
  const { t } = useTranslation()

  const dateFormat = useHookstate('timeAgo' as 'timeAgo' | 'exact')

  const projectHistoryQuery = useFind(projectHistoryPath, {
    query: {
      projectId: projectId,
      $sort: {
        createdAt: -1
      },
      $limit: PROJECT_HISTORY_PAGE_LIMIT
    }
  })

  useEffect(() => {
    console.log('projectHistoryQuery: ', projectHistoryQuery.data)
  }, [projectHistoryQuery.data])

  const sortOrder = projectHistoryQuery.sort.createdAt

  const toggleSortOrder = () => {
    projectHistoryQuery.setSort({
      createdAt: sortOrder === -1 ? 1 : -1
    })
  }

  return (
    <div className="mt-[40px] flex-row justify-between gap-5">
      <Button onClick={toggleSortOrder} endIcon={sortOrder === -1 ? <FaSortAmountDown /> : <FaSortAmountUpAlt />}>
        {sortOrder === -1 ? t('multitenancy:common.newestFirst') : t('multitenancy:common.oldestFirst')}
      </Button>

      {projectHistoryQuery.data &&
        projectHistoryQuery.data.map((projectHistory, index) => (
          <HistoryLog key={index} projectHistory={projectHistory} projectName={projectName} />
        ))}

      <TablePagination
        totalPages={Math.ceil(projectHistoryQuery.total / projectHistoryQuery.limit)}
        currentPage={projectHistoryQuery.page}
        onPageChange={(newPage) => projectHistoryQuery.setPage(newPage)}
      />
    </div>
  )
}
