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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useFind, useMutation } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import {
  locationAdminPath,
  moderationAttachmentPath,
  moderationBanPath,
  ModerationID,
  moderationPath,
  ModerationType,
  userPath
} from '@ir-engine/common/src/schema.type.module'
import { toDisplayDateTime, toDisplayDateTimeUtc } from '@ir-engine/common/src/utils/datetime-sql'
import { Button } from '@ir-engine/ui'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { IoArrowBack } from 'react-icons/io5'
import { NotificationService } from '../../../common/services/NotificationService'
import { LocationLabel } from './common/LocationLabel'
import { UserInfo } from './common/UserInfo'

export const ModerationDetail = ({
  report: moderation,
  onBack,
  onResloved
}: {
  report: ModerationType
  onBack: () => void
  onResloved: (report: ModerationType) => void
}) => {
  const isUserModeration = moderation.type === 'user'
  const { t } = useTranslation()
  const moderationMutation = useMutation(moderationPath)
  const moderationBanMutation = useMutation(moderationBanPath)

  const moderationBanQuery = useFind(moderationBanPath, {
    query: {
      action: 'admin',
      banUserId: moderation.reportedUserId
    }
  })

  const locationAdminQuery = useFind(locationAdminPath, {
    query: {
      action: 'admin',
      userId: moderation.reportedUserId,
      locationId: moderation.reportedLocationId
    }
  })

  const handleMarkAsHandled = () => {
    const result = moderationMutation.patch(moderation.id, {
      status: 'resolved'
    })
    result
      .then(() => {
        onResloved(moderation)
        NotificationService.dispatchNotify(t('admin:components.moderation.reportResolved'), {
          variant: 'success'
        })
      })
      .catch((error) => {
        NotificationService.dispatchNotify(error.message, { variant: 'error' })
        console.error(error)
      })
  }

  const handleBanUser = () => {
    if (moderationBanQuery.data.length > 0) {
      moderationBanMutation
        .patch(moderationBanQuery.data[0].id, {
          banned: true
        })
        .then(() => {
          NotificationService.dispatchNotify(t('admin:components.moderation.userBanned'), {
            variant: 'success'
          })
        })
        .catch((error) => {
          NotificationService.dispatchNotify(error.message, { variant: 'error' })
          console.error(error)
        })
    } else {
      moderationBanMutation
        .create({
          banUserId: moderation.reportedUserId!,
          banned: true,
          banReason: moderation.abuseReason,
          reportedAt: moderation.reportedAt,
          moderationId: moderation.id as ModerationID,
          ipAddress: moderation.ipAddress,
          reportedLocationId: moderation.reportedLocationId
        })
        .then((_value) => {
          NotificationService.dispatchNotify(t('admin:components.moderation.userBanned'), {
            variant: 'success'
          })
        })
        .catch((error) => {
          NotificationService.dispatchNotify(error.message, { variant: 'error' })
          console.error(error)
        })
    }
  }

  const usersQuery =
    moderation.type === 'user'
      ? useFind(userPath, {
          query: {
            id: { $in: [moderation.reportedUserId, moderation.createdBy] },
            $limit: 2
          }
        })
      : useFind(userPath, {
          query: {
            id: { $in: [moderation.createdBy] },
            $limit: 1
          }
        })

  const reportAttachments = useFind(moderationAttachmentPath, {
    query: {
      moderationId: moderation.id
    }
  })

  const getFullUrl = (path: string) => {
    const baseUrl = config.client.clientUrl
    return `${baseUrl}${path}`
  }

  const handleExport = () => {
    const headers = [
      t('admin:components.moderation.type'),
      t('admin:components.moderation.usernameBeingReported'),
      t('admin:components.moderation.userId'),
      t('admin:components.moderation.reporter'),
      t('admin:components.moderation.reason'),
      t('admin:components.moderation.status'),
      t('admin:components.moderation.dateReported'),
      t('admin:components.moderation.details')
    ]
    const rows = [
      moderation.type,
      usersQuery.data.find((user) => user.id == moderation.reportedUserId)?.name,
      moderation.reportedUserId,
      usersQuery.data.find((user) => user.id == moderation.createdBy)?.name,
      moderation.abuseReason,
      moderation.status,
      `"${toDisplayDateTime(moderation.createdAt)}"`,
      `"${moderation.reportDetails}"`
    ]

    // Attachments section
    const attachmentHeader = [t('admin:components.moderation.uploadedFiles')]
    const attachmentRows = reportAttachments.data.map((attachment) => [`"${getFullUrl(attachment.filePath)}"`])

    // Combine all rows with empty row separators
    const csvContent = [
      headers.join(','), // Add headers
      rows.join(','),
      '', // Empty row as separator
      attachmentHeader.join(','),
      ...attachmentRows.map((row) => row.join(',')) // Add rows
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', t('admin:components.moderation.reportCsvFilename'))
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (usersQuery.status !== 'success' && reportAttachments.status !== 'success') {
    return <LoadingView fullScreen className="block h-12 w-12" title={t('admin:components.moderation.loading')} />
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <button onClick={onBack} className="flex items-center">
          <IoArrowBack className="mr-2" />
        </button>
        <span className="ml-4">{t('admin:components.moderation.reportDetails')}</span>
      </div>
      <div className="mb-4 rounded-lg p-4 shadow">
        <div className="grid grid-cols-[30%_70%] gap-4">
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.id')}</Text>
          <Text className="mb-4">{moderation.referenceNumber}</Text>
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.type')}</Text>
          <Text className="mb-4">
            {moderation.type == 'location' ? t('admin:components.moderation.space') : moderation.type}
          </Text>
          {isUserModeration && (
            <>
              <Text className="mb-4 text-text-primary">{t('admin:components.moderation.usernameBeingReported')}</Text>
              <UserInfo
                userId={moderation.reportedUserId}
                userEmail={moderation.reportedUserEmail}
                usersQuery={usersQuery}
              />
              <Text className="mb-4 text-text-primary">{t('admin:components.moderation.accountType')}</Text>
              <Text className="mb-4">
                {locationAdminQuery && locationAdminQuery.status == 'success' && locationAdminQuery.data.length > 0
                  ? t('admin:components.moderation.owner')
                  : t('admin:components.moderation.user')}
              </Text>
            </>
          )}
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.reasonForAbuse')}</Text>
          <Text className="mb-4">{t(`user:moderation.abuseReason.${moderation.abuseReason}`)}</Text>
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.dateReported')}</Text>
          <Text className="mb-4">{toDisplayDateTimeUtc(moderation?.reportedAt)} UTC</Text>
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.reporter')}</Text>
          <UserInfo userId={moderation.createdBy} userEmail={moderation.createdByEmail} usersQuery={usersQuery} />
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.space')}</Text>
          <Text className="mb-4">
            {moderation.reportedLocationId && (
              <LocationLabel locationId={moderation.reportedLocationId} showUrl={true} />
            )}
          </Text>
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.ipAddress')}</Text>
          <Text className="mb-4">{moderation.ipAddress}</Text>
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.reportedUserIp')}</Text>
          <Text className="mb-4">{moderation.reportedUserIpAddress}</Text>
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.reportDetails')}</Text>
          <Text className="mb-4 mr-4 rounded-lg bg-[#f0f0f0] p-4 font-medium text-[#4a5568] dark:bg-surface-1 dark:text-text-primary">
            {moderation?.reportDetails}
          </Text>
          <Text className="mb-4 text-text-primary">{t('admin:components.moderation.uploadedFiles')}</Text>
          <div className="mb-4 flex flex-col space-y-2">
            {reportAttachments.data.map((attachment) => (
              <Text key={attachment.id}>
                <a
                  href={attachment.filePath}
                  className="cursor-pointer border-none bg-transparent px-0 py-0 text-blue-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {attachment.fileName}
                </a>
              </Text>
            ))}
          </div>
        </div>
        <div className="col-span-2 mt-4 flex justify-between">
          <Button onClick={handleExport} className="ui-primary rounded px-4 py-2 text-sm text-text-primary">
            {t('admin:components.moderation.exportReport')}
          </Button>
          <div className="flex space-x-4">
            <Button
              onClick={handleMarkAsHandled}
              disabled={moderation.status == 'resolved'}
              variant="green"
              className="ui-success rounded px-4 py-2 text-sm text-text-primary disabled:text-text-primary"
            >
              {t('admin:components.moderation.resolveIssue')}
            </Button>
            {isUserModeration && !moderationBanQuery?.data[0]?.banned && (
              <Button variant="red" onClick={handleBanUser} className="ui-danger rounded px-4 py-2">
                {t('admin:components.moderation.banUser')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
