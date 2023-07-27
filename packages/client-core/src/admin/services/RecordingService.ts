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

import { Paginated } from '@feathersjs/feathers'
import { useEffect } from 'react'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'

type RecordingResultFetch = RecordingResult & { 'user.name': string }

export const RECORDING_PAGE_LIMIT = 10

export const AdminRecordingState = defineState({
  name: 'AdminRecordingState',
  initial: () => ({
    recordings: [] as Array<RecordingResultFetch>,
    skip: 0,
    limit: RECORDING_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminRecordingService = {
  fetchAdminRecordings: async (
    _value: string | null = null,
    $skip = 0,
    sortField = 'createdAt',
    orderBy = 'asc',
    $limit = RECORDING_PAGE_LIMIT
  ) => {
    try {
      const $sort = sortField.length > 0 ? { [sortField]: orderBy === 'desc' ? -1 : 1 } : {}
      const recordings = (await Engine.instance.api.service('recording').find({
        query: {
          $skip,
          $sort,
          $limit,
          action: 'admin'
        }
      })) as Paginated<RecordingResultFetch>

      getMutableState(AdminRecordingState).merge({
        recordings: recordings.data,
        skip: recordings.skip,
        limit: recordings.limit,
        total: recordings.total,
        retrieving: false,
        fetched: true,
        updateNeeded: false,
        lastFetched: Date.now()
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeRecording: async (id: string) => {
    await Engine.instance.api.service('recording').remove(id)
    getMutableState(AdminRecordingState).merge({ updateNeeded: true })
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = () => {
        getMutableState(AdminRecordingState).merge({ updateNeeded: true })
      }
      Engine.instance.api.service('instance').on('removed', listener)
      return () => {
        Engine.instance.api.service('instance').off('removed', listener)
      }
    }, [])
  }
}

export const AdminSingleRecordingState = defineState({
  name: 'AdminSingleRecordingState',
  initial: () => ({
    recording: null as RecordingResult | null
  })
})

export const AdminSingleRecordingService = {
  fetchSingleAdminRecording: async (id: RecordingResult['id']) => {
    const recording = await Engine.instance.api.service('recording').get(id)
    getMutableState(AdminSingleRecordingState).merge({ recording })
  }
}
