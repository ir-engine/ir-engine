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
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'
import { AuthState } from '../../user/services/AuthService'

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

const instancesRetrievedReceptor = (action: typeof AdminInstanceActions.instancesRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminInstanceState)
  return state.merge({
    instances: action.instanceResult.data,
    skip: action.instanceResult.skip,
    limit: action.instanceResult.limit,
    total: action.instanceResult.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const instanceRemovedReceptor = (action: typeof AdminInstanceActions.instanceRemoved.matches._TYPE) => {
  const state = getMutableState(AdminInstanceState)
  return state.merge({ updateNeeded: true })
}

export const AdminInstanceReceptors = {
  instancesRetrievedReceptor,
  instanceRemovedReceptor
}

//Service
export const AdminInstanceService = {
  fetchAdminInstances: async (value: string | null = null, skip = 0, sortField = 'createdAt', orderBy = 'asc') => {
    const user = getMutableState(AuthState).user
    try {
      if (user.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
        let sortData = {}
        if (sortField.length > 0) {
          sortData[sortField] = orderBy === 'desc' ? 0 : 1
        }
        const instances = (await API.instance.client.service('instance').find({
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
        dispatchAction(AdminInstanceActions.instancesRetrieved({ instanceResult: instances }))
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeInstance: async (id: string) => {
    const result = (await API.instance.client.service('instance').patch(id, { ended: true })) as Instance
    dispatchAction(AdminInstanceActions.instanceRemoved({ instance: result }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = (params) => {
        dispatchAction(AdminInstanceActions.instanceRemoved({ instance: params.instance }))
      }
      API.instance.client.service('instance').on('removed', listener)
      return () => {
        API.instance.client.service('instance').off('removed', listener)
      }
    }, [])
  }
}

export class AdminInstanceActions {
  static instancesRetrieved = defineAction({
    type: 'ee.client.AdminInstance.INSTANCES_RETRIEVED',
    instanceResult: matches.object as Validator<unknown, Paginated<Instance>>
  })

  static instanceRemoved = defineAction({
    type: 'ee.client.AdminInstance.INSTANCE_REMOVED_ROW',
    instance: matches.object as Validator<unknown, Instance>
  })
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

const userInstancesReceivedReceptor = (
  action: typeof AdminInstanceUserActions.instanceUsersRetrieved.matches._TYPE
) => {
  const state = getMutableState(AdminInstanceUserState)
  return state.merge({
    users: action.users.data,
    skip: action.users.skip,
    limit: action.users.limit,
    total: action.users.total,
    fetched: true,
    lastFetched: Date.now()
  })
}

export const AdminInstanceUserReceptors = {
  userInstancesReceivedReceptor
}

export const AdminInstanceUserService = {
  fetchUsersInInstance: async (instanceId: string) => {
    const instanceAttendances = await API.instance.client.service('instance-attendance').find({
      query: {
        instanceId
      }
    })

    if (!('data' in instanceAttendances) || instanceAttendances.data.length === 0) return

    const userIds = instanceAttendances.data.map((d: any) => d.userId)

    const users = await API.instance.client.service('user').find({
      query: {
        id: {
          $in: userIds
        }
      }
    })

    if (!('data' in users)) return

    dispatchAction(AdminInstanceUserActions.instanceUsersRetrieved({ users }))
  },
  kickUser: async (kickData: { userId: UserInterface['id']; instanceId: Instance['id']; duration: string }) => {
    const duration = new Date()
    if (kickData.duration === 'INFINITY') {
      duration.setFullYear(duration.getFullYear() + 10) // ban for 10 years
    } else {
      duration.setHours(duration.getHours() + parseInt(kickData.duration, 10))
    }

    const userKick = await API.instance.client.service('user-kick').create({ ...kickData, duration })

    console.log('user kicked ->', userKick)

    NotificationService.dispatchNotify(`user was kicked`, { variant: 'default' })
  }
}

export class AdminInstanceUserActions {
  static instanceUsersRetrieved = defineAction({
    type: 'ee.client.AdminInstanceUser.USER_INSTANCES_RETRIEVED',
    users: matches.object as Validator<unknown, Paginated<UserInterface>>
  })
}
