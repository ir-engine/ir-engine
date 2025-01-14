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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiPencil, HiTrash } from 'react-icons/hi2'
import { validate as isValidUUID } from 'uuid'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useFind, useMutation, useSearch } from '@ir-engine/common'
import { locationPath, LocationType, scopePath, ScopeType } from '@ir-engine/common/src/schema.type.module'
import { Button } from '@ir-engine/ui'
import ConfirmDialog from '@ir-engine/ui/src/components/tailwind/ConfirmDialog'

import config from '@ir-engine/common/src/config'
import { Engine } from '@ir-engine/ecs'
import { locationColumns, LocationRowType } from '../../common/constants/location'
import DataTable from '../../common/Table'
import AddEditLocationModal from './AddEditLocationModal'

const getStudioURLfromScene = (url: string) => {
  const key = url.replace(config.client.fileServer, '')
  const [, orgName, projectName] = key.split('/')
  return `/studio?projectName=${orgName}/${projectName}&scenePath=${key}`
}

const transformLink = (link: string) => link.toLowerCase().replace(' ', '-')

export default function LocationTable({ search }: { search: string }) {
  const { t } = useTranslation()

  const scopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.userID,
      type: 'location:write' as ScopeType
    }
  })

  const userHasAccess = scopeQuery.data.length > 0

  const adminLocationQuery = useFind(locationPath, {
    query: {
      action: 'admin',
      $limit: 20,
      $sort: {
        name: 1
      }
    }
  })

  useSearch(
    adminLocationQuery,
    {
      $or: [
        {
          id: isValidUUID(search) ? search : undefined
        },
        {
          name: {
            $like: `%${search}%`
          }
        },
        {
          sceneId: isValidUUID(search) ? search : undefined
        }
      ]
    },
    search
  )

  const adminLocationRemove = useMutation(locationPath).remove

  const createRows = (rows: readonly LocationType[]): LocationRowType[] =>
    rows.map((row) => ({
      name: (
        <a target="_blank" rel="noopener noreferrer" href={`/location/${transformLink(row.name)}`}>
          {row.name}
        </a>
      ),
      sceneId: (
        <a target="_blank" rel="noopener noreferrer" href={getStudioURLfromScene(row.sceneURL)}>
          {row.sceneId}
        </a>
      ),
      maxUsersPerInstance: row.maxUsersPerInstance.toString(),
      scene: row.slugifiedName,
      locationType: row.locationSetting.locationType,
      videoEnabled: row.locationSetting.videoEnabled
        ? t('admin:components.common.yes')
        : t('admin:components.common.no'),
      action: (
        <div className="flex items-center justify-start gap-3">
          <Button
            variant="tertiary"
            className="h-8 w-8"
            disabled={!userHasAccess}
            title={t('admin:components.common.view')}
            onClick={() => PopoverState.showPopupover(<AddEditLocationModal action="admin" location={row} />)}
          >
            <HiPencil className="text-theme-iconGreen" />
          </Button>
          <Button
            variant="tertiary"
            className="h-8 w-8"
            title={t('admin:components.common.delete')}
            onClick={() =>
              PopoverState.showPopupover(
                <ConfirmDialog
                  text={`${t('admin:components.location.confirmLocationDelete')} '${row.name}'?`}
                  onSubmit={async () => {
                    await adminLocationRemove(row.id)
                  }}
                />
              )
            }
          >
            <HiTrash className="place-self-center text-theme-iconRed" />
          </Button>
        </div>
      )
    }))

  return (
    <DataTable
      size="xl"
      query={adminLocationQuery}
      columns={locationColumns}
      rows={createRows(adminLocationQuery.data)}
    />
  )
}
