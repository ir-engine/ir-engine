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

import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { userIsAdmin } from '../../user/userHasAccess'

export const INSTANCE_PAGE_LIMIT = 100

export const AdminInstanceState = defineState({
  name: 'AdminInstanceState',
  initial: () => ({
    instances: [] as Array<Instance>,
    skip: 0,
    limit: INSTANCE_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminInstanceService = {
  fetchAdminInstances: async (
    value: string | null = null,
    skip = 0,
    sortField = 'createdAt',
    orderBy: 'desc' | 'asc' = 'asc'
  ) => {
    if (!userIsAdmin()) return

    try {
      const sortData = sortField.length ? { [sortField]: orderBy === 'desc' ? 0 : 1 } : {}
      const instances = (await Engine.instance.api.service('instance').find({
        query: {
          $sort: {
            ...sortData
          },
          $skip: skip * INSTANCE_PAGE_LIMIT,
          $limit: INSTANCE_PAGE_LIMIT,
          action: 'admin',
          search: value
        }
      })) as Paginated<Instance>

      getMutableState(AdminInstanceState).merge({
        instances: instances.data,
        skip: instances.skip,
        limit: instances.limit,
        total: instances.total,
        retrieving: false,
        fetched: true,
        updateNeeded: false,
        lastFetched: Date.now()
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeInstance: async (id: string) => {
    await Engine.instance.api.service('instance').patch(id, { ended: true })
    getMutableState(AdminInstanceState).merge({ updateNeeded: true })
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = () => {
        getMutableState(AdminInstanceState).merge({ updateNeeded: true })
      }
      Engine.instance.api.service('instance').on('removed', listener)
      return () => {
        Engine.instance.api.service('instance').off('removed', listener)
      }
    }, [])
  }
}

export const INSTANCE_USERS_PAGE_LIMIT = 10

export const AdminInstanceUserState = defineState({
  name: 'AdminInstanceUserState',
  initial: () => ({
    users: [] as Array<UserInterface>,
    skip: 0,
    limit: INSTANCE_USERS_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    created: false,
    lastFetched: Date.now()
  })
})

export const AdminInstanceUserService = {
  fetchUsersInInstance: async (instanceId: string) => {
    const instanceAttendances = await Engine.instance.api.service('instance-attendance').find({
      query: {
        instanceId
      }
    })

    if (!('data' in instanceAttendances) || instanceAttendances.data.length === 0) return

    const userIds = instanceAttendances.data.map((d: any) => d.userId)

    const users = await Engine.instance.api.service('user').find({
      query: {
        id: {
          $in: userIds
        }
      }
    })

    if (!('data' in users)) return

    getMutableState(AdminInstanceUserState).merge({
      users: users.data,
      skip: users.skip,
      limit: users.limit,
      total: users.total,
      fetched: true,
      lastFetched: Date.now()
    })
  },
  kickUser: async (kickData: { userId: UserInterface['id']; instanceId: Instance['id']; duration: string }) => {
    const duration = new Date()
    if (kickData.duration === 'INFINITY') {
      duration.setFullYear(duration.getFullYear() + 10) // ban for 10 years
    } else {
      duration.setHours(duration.getHours() + parseInt(kickData.duration, 10))
    }

    await Engine.instance.api.service('user-kick').create({ ...kickData, duration })

    NotificationService.dispatchNotify(`user was kicked`, { variant: 'default' })
  }
}
