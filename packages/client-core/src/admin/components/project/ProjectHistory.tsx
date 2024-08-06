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

import { projectHistoryPath } from '@etherealengine/common/src/schema.type.module'
import { ProjectHistoryType } from '@etherealengine/common/src/schemas/projects/project-history.schema'
import { useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'

import AvatarImage from '@etherealengine/ui/src/primitives/tailwind/AvatarImage'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import { TablePagination } from '@etherealengine/ui/src/primitives/tailwind/Table'
import Text from '@etherealengine/ui/src/primitives/tailwind/Text'
import Tooltip from '@etherealengine/ui/src/primitives/tailwind/Tooltip'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSortAmountDown, FaSortAmountUpAlt } from 'react-icons/fa'

const PROJECT_HISTORY_PAGE_LIMIT = 10

const getRelativeURLFromProject = (projectName: string, url: string) => {
  const prefix = `projects/${projectName}/`
  if (url.startsWith(prefix)) {
    return url.replace(prefix, '')
  }
  return url
}

const getResourceURL = (projectName: string, url: string, resourceType: 'resource' | 'scene') => {
  const relativeURL = getRelativeURLFromProject(projectName, url)
  const resourceURL =
    resourceType === 'resource'
      ? `/projects/${projectName}/${relativeURL}`
      : `/studio?project=${projectName}&scenePath=${url}`
  return {
    relativeURL,
    resourceURL
  }
}

function HistoryLog({ projectHistory, projectName }: { projectHistory: ProjectHistoryType; projectName: string }) {
  const { t } = useTranslation()

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

  const RenderAction = () => {
    if (projectHistory.action === 'LOCATION_PUBLISHED' || projectHistory.action === 'LOCATION_UNPUBLISHED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        locationName: string
        sceneURL: string
        sceneId: string
      }

      const verb = projectHistory.action === 'LOCATION_PUBLISHED' ? 'published' : 'unpublished'

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.sceneURL, 'scene')

      return (
        <>
          <Text id="blah">{verb} the location</Text>

          <a href={`/location/${actionDetail.locationName}`}>
            <Text className="underline-offset-4 hover:underline" fontWeight="semibold">
              {actionDetail.locationName}
            </Text>
          </a>

          <Text>from the scene</Text>

          <Text href={resourceURL} component="a" className="underline-offset-4 hover:underline" fontWeight="semibold">
            {relativeURL}.
          </Text>
        </>
      )
    } else if (projectHistory.action === 'LOCATION_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        locationName: string
      }

      return (
        <>
          <Text id="blah">modified the location</Text>

          <a href={`/location/${actionDetail.locationName}`}>
            <Text className="underline-offset-4 hover:underline" fontWeight="semibold">
              {actionDetail.locationName}
            </Text>
          </a>
        </>
      )
    } else if (projectHistory.action === 'PERMISSION_CREATED' || projectHistory.action === 'PERMISSION_REMOVED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        userName: string
        permissionType: string
      }

      const verb = projectHistory.action === 'PERMISSION_CREATED' ? 'added' : 'removed'
      const userId = projectHistory.actionIdentifier

      return (
        <>
          <Text>{verb} the</Text>
          <Text fontWeight="semibold">{actionDetail.permissionType}</Text>

          <Text>access to</Text>

          <Tooltip title={`UserId: ${userId}`}>
            <Text>{actionDetail.userName}</Text>
          </Tooltip>
        </>
      )
    } else if (projectHistory.action === 'PERMISSION_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        userName: string
        oldPermissionType: string
        newPermissionType: string
      }

      const userId = projectHistory.actionIdentifier

      return (
        <>
          <Text>updated the permission of the user</Text>
          <Tooltip title={`UserId: ${userId}`}>
            <Text>{actionDetail.userName}</Text>
          </Tooltip>
          <Text>from</Text>
          <Text fontWeight="semibold">{actionDetail.oldPermissionType}</Text>
          <Text>to</Text>
          <Text fontWeight="semibold">{actionDetail.newPermissionType}</Text>
        </>
      )
    } else if (projectHistory.action === 'PROJECT_CREATED') {
      return <Text>created the project</Text>
    } else if (
      projectHistory.action === 'RESOURCE_CREATED' ||
      projectHistory.action === 'RESOURCE_REMOVED' ||
      projectHistory.action === 'SCENE_CREATED' ||
      projectHistory.action === 'SCENE_REMOVED'
    ) {
      const verb =
        projectHistory.action === 'RESOURCE_CREATED' || projectHistory.action === 'SCENE_CREATED'
          ? 'created'
          : 'removed'
      const object =
        projectHistory.action === 'RESOURCE_CREATED' || projectHistory.action === 'RESOURCE_REMOVED'
          ? 'resource'
          : 'scene'

      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        url: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, object)

      return (
        <>
          <Text>
            {verb} the {object}
          </Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'RESOURCE_RENAMED' || projectHistory.action === 'SCENE_RENAMED') {
      const object = projectHistory.action === 'RESOURCE_RENAMED' ? 'resource' : 'scene'
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        oldURL: string
        newURL: string
      }

      const { relativeURL: oldRelativeURL } = getResourceURL(projectName, actionDetail.oldURL, object)
      const { relativeURL: newRelativeURL, resourceURL: newResourceURL } = getResourceURL(
        projectName,
        actionDetail.newURL,
        object
      )

      return (
        <>
          <Text>renamed a {object} from</Text>

          <Text fontWeight="semibold">{oldRelativeURL}</Text>
          <Text>to</Text>
          <Text
            href={newResourceURL}
            component="a"
            fontWeight="semibold"
            className="underline-offset-4 hover:underline"
          >
            {getRelativeURLFromProject(projectName, newRelativeURL)}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'RESOURCE_MODIFIED' || projectHistory.action === 'SCENE_MODIFIED') {
      const object = projectHistory.action === 'RESOURCE_MODIFIED' ? 'resource' : 'scene'
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        url: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, object)

      return (
        <>
          <Text>modified the {object}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    }

    return null
  }

  return (
    <div className="mb-3 flex w-full items-center justify-between rounded-lg bg-[#191B1F] px-5 py-2">
      <div className="grid grid-flow-col place-items-center gap-x-2 [&>*]:text-nowrap">
        <AvatarImage
          className="inline-grid min-h-10 min-w-10 rounded-full"
          src={projectHistory.userAvatarURL}
          name={projectHistory.userName}
        />

        <Text className="text-nowrap">{projectHistory.userName}</Text>

        <RenderAction />
      </div>

      <Text className="text-nowrap">{dateStr}</Text>
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
      <Button
        className="mb-4"
        onClick={toggleSortOrder}
        endIcon={sortOrder === -1 ? <FaSortAmountDown /> : <FaSortAmountUpAlt />}
      >
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
