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

import { useFind } from '@ir-engine/common'
import { projectHistoryPath, ProjectHistoryType } from '@ir-engine/common/src/schema.type.module'

import { toDisplayDateTime } from '@ir-engine/common/src/utils/datetime-sql'
import { Tooltip } from '@ir-engine/ui'
import AvatarImage from '@ir-engine/ui/src/primitives/tailwind/AvatarImage'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { TablePagination } from '@ir-engine/ui/src/primitives/tailwind/Table'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaSortAmountDown, FaSortAmountUpAlt } from 'react-icons/fa'
import { FiRefreshCw } from 'react-icons/fi'

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

  const RenderAction = () => {
    if (projectHistory.action === 'LOCATION_PUBLISHED' || projectHistory.action === 'LOCATION_UNPUBLISHED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        locationName: string
        sceneURL: string
        sceneId: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.sceneURL, 'scene')

      return (
        <>
          <Text>
            {projectHistory.action === 'LOCATION_PUBLISHED'
              ? t('admin:components.history.publishedLocation')
              : t('admin:components.history.unpublishedLocation')}
          </Text>

          {projectHistory.action === 'LOCATION_PUBLISHED' ? (
            <a href={`/location/${actionDetail.locationName}`}>
              <Text className="underline-offset-4 hover:underline" fontWeight="semibold">
                {actionDetail.locationName}
              </Text>
            </a>
          ) : (
            <Text fontWeight="semibold">{actionDetail.locationName}</Text>
          )}

          <Text>{t('admin:components.history.fromScene')}</Text>

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
          <Text>{t('admin:components.history.modifiedLocation')}</Text>

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
        userId: string
        permissionType: string
      }

      return (
        <>
          <Text>
            {projectHistory.action === 'PERMISSION_CREATED'
              ? t('admin:components.history.added')
              : t('admin:components.history.removed')}
          </Text>

          <Text fontWeight="semibold">{actionDetail.permissionType}</Text>

          <Text>{t('admin:components.history.accessTo')}</Text>

          <Tooltip content={`UserId: ${actionDetail.userId}`}>
            <Text>{actionDetail.userName}</Text>
          </Tooltip>
        </>
      )
    } else if (projectHistory.action === 'PERMISSION_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        userName: string
        userId: string
        oldPermissionType: string
        newPermissionType: string
      }

      return (
        <>
          <Text>{t('admin:components.history.updatePermission')}</Text>
          <Tooltip content={`UserId: ${actionDetail.userId}`}>
            <Text>{actionDetail.userName}</Text>
          </Tooltip>
          <Text>{t('admin:components.setting.from').toLowerCase()}</Text>
          <Text fontWeight="semibold">{actionDetail.oldPermissionType}</Text>
          <Text>{t('admin:components.setting.to').toLowerCase()}</Text>
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
            {projectHistory.action.endsWith('CREATED')
              ? t('admin:components.history.created')
              : t('admin:components.history.removed')}{' '}
            {object}
          </Text>

          {projectHistory.action.endsWith('CREATED') ? (
            <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
              {relativeURL}
            </Text>
          ) : (
            <Text fontWeight="semibold">{relativeURL}</Text>
          )}
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
          <Text>
            {t('admin:components.history.renamed')} {object} {t('admin:components.setting.from').toLowerCase()}
          </Text>

          <Text fontWeight="semibold">{oldRelativeURL}</Text>
          <Text>{t('admin:components.setting.to').toLowerCase()}</Text>
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
          <Text>
            {t('admin:components.history.modified')} {object}
          </Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'TAGS_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        url: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, 'resource')

      return (
        <>
          <Text>{t('admin:components.history.updatedTags')}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'THUMBNAIL_CREATED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        thumbnailURL: string
        url: string
      }

      const { relativeURL: relativeThumbnailURL, resourceURL: thumbnailResourceURL } = getResourceURL(
        projectName,
        actionDetail.thumbnailURL,
        'resource'
      )

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, 'resource')

      return (
        <>
          <Text>{t('admin:components.history.createdThumbnail')}</Text>
          <Text
            href={thumbnailResourceURL}
            component="a"
            fontWeight="semibold"
            className="underline-offset-4 hover:underline"
          >
            {relativeThumbnailURL}
          </Text>
          <Text>{t('admin:components.setting.for').toLowerCase()}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'THUMBNAIL_MODIFIED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        oldThumbnailURL: string
        newThumbnailURL: string
        url: string
      }

      const { relativeURL: relativeThumbnailURL, resourceURL: thumbnailResourceURL } = getResourceURL(
        projectName,
        actionDetail.newThumbnailURL,
        'resource'
      )

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, 'resource')

      return (
        <>
          <Text>{t('admin:components.history.updatedThumbnail')}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
          <Text>{t('admin:components.setting.to').toLowerCase()}</Text>
          <Text
            href={thumbnailResourceURL}
            component="a"
            fontWeight="semibold"
            className="underline-offset-4 hover:underline"
          >
            {relativeThumbnailURL}
          </Text>
        </>
      )
    } else if (projectHistory.action === 'THUMBNAIL_REMOVED') {
      const actionDetail = JSON.parse(projectHistory.actionDetail) as {
        url: string
      }

      const { relativeURL, resourceURL } = getResourceURL(projectName, actionDetail.url, 'resource')

      return (
        <>
          <Text>{t('admin:components.history.removedThumbnail')}</Text>
          <Text href={resourceURL} component="a" fontWeight="semibold" className="underline-offset-4 hover:underline">
            {relativeURL}
          </Text>
        </>
      )
    }

    return null
  }

  return (
    <div className="mb-3 flex w-full items-center justify-between gap-x-2 rounded-lg bg-[#191B1F] px-5 py-2">
      <AvatarImage
        className="inline-grid min-h-10 min-w-10 rounded-full"
        src={projectHistory.userAvatarURL}
        name={projectHistory.userName}
      />

      <div className="flex w-full flex-wrap items-center justify-start gap-x-2 [&>*]:whitespace-nowrap">
        <Text>{projectHistory.userName}</Text>

        <RenderAction />
      </div>

      <Text className="text-nowrap">{toDisplayDateTime(projectHistory.createdAt)}</Text>
    </div>
  )
}

export const ProjectHistory = ({ projectId, projectName }: { projectId: string; projectName: string }) => {
  const { t } = useTranslation()
  const projectHistoryQuery = useFind(projectHistoryPath, {
    query: {
      projectId: projectId,
      $sort: {
        createdAt: -1
      },
      $limit: PROJECT_HISTORY_PAGE_LIMIT
    }
  })

  const sortOrder = projectHistoryQuery.sort.createdAt

  const toggleSortOrder = () => {
    projectHistoryQuery.setSort({
      createdAt: sortOrder === -1 ? 1 : -1
    })
  }

  useEffect(() => {
    projectHistoryQuery.refetch()
  }, [])

  return (
    <div className="w-full flex-row justify-between gap-5 px-2">
      <div className="mb-4 flex items-center justify-start gap-3">
        <Button onClick={toggleSortOrder} endIcon={sortOrder === -1 ? <FaSortAmountDown /> : <FaSortAmountUpAlt />}>
          {sortOrder === -1 ? t('admin:components.common.newestFirst') : t('admin:components.common.oldestFirst')}
        </Button>

        <Button startIcon={<FiRefreshCw />} onClick={projectHistoryQuery.refetch}>
          {t('admin:components.common.refresh')}
        </Button>
      </div>

      {projectHistoryQuery.data &&
        projectHistoryQuery.data.map((projectHistory, index) => (
          <HistoryLog key={index} projectHistory={projectHistory} projectName={projectName} />
        ))}

      <TablePagination
        totalPages={Math.ceil(projectHistoryQuery.total / projectHistoryQuery.limit)}
        currentPage={projectHistoryQuery.page}
        onPageChange={(newPage) => {
          projectHistoryQuery.setPage(newPage)
          projectHistoryQuery.refetch()
        }}
      />
    </div>
  )
}
