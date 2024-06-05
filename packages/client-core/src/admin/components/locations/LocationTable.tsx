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
import { HiPencil, HiTrash } from 'react-icons/hi2'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { locationPath, LocationType } from '@etherealengine/common/src/schema.type.module'
import { useFind, useMutation, useSearch } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import ConfirmDialog from '@etherealengine/ui/src/components/tailwind/ConfirmDialog'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'

import { userHasAccess } from '../../../user/userHasAccess'
import { locationColumns, LocationRowType } from '../../common/constants/location'
import DataTable from '../../common/Table'
import AddEditLocationModal from './AddEditLocationModal'

const transformLink = (link: string) => link.toLowerCase().replace(' ', '-')

export default function LocationTable({ search }: { search: string }) {
  const { t } = useTranslation()

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
          name: {
            $like: `%${search}%`
          }
        },
        {
          sceneId: {
            $like: `%${search}%`
          }
        }
      ]
    },
    search
  )

  const adminLocationRemove = useMutation(locationPath).remove

  const createRows = (rows: readonly LocationType[]): LocationRowType[] =>
    rows.map((row) => ({
      name: <a href={`/location/${transformLink(row.name)}`}>{row.name}</a>,
      sceneId: (
        <a href={`/studio?projectName=${row.sceneAsset.projectName}&scenePath=${row.sceneAsset.assetURL}`}>
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
            rounded="full"
            variant="outline"
            className="h-8 w-8"
            disabled={!userHasAccess('location:write')}
            title={t('admin:components.common.view')}
            onClick={() => PopoverState.showPopupover(<AddEditLocationModal location={row} />)}
          >
            <HiPencil className="place-self-center text-theme-iconGreen" />
          </Button>
          <Button
            rounded="full"
            variant="outline"
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

  return <DataTable query={adminLocationQuery} columns={locationColumns} rows={createRows(adminLocationQuery.data)} />
}
