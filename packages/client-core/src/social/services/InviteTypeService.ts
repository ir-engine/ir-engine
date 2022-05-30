import { Paginated } from '@feathersjs/feathers'
import { createState, useState } from '@speigg/hookstate'

import { InviteType } from '@xrengine/common/src/interfaces/InviteType'

import { NotificationService } from '../../common/services/NotificationService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
const state = createState({
  invitesType: [] as Array<InviteType>,
  skip: 0,
  limit: 5,
  total: 0
})

store.receptors.push((action: InviteTypeActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOAD_INVITE_TYPE':
        return s.merge({
          invitesType: action.invitesType,
          skip: action.skip,
          limit: action.limit,
          total: action.total
        })
    }
  }, action.type)
})

export const accessInviteTypeState = () => state

export const useInviteTypeState = () => useState(state) as any as typeof state

//Service
export const InviteTypeService = {
  retrieveInvites: async () => {
    const dispatch = useDispatch()

    dispatch(InviteTypeAction.fetchingInvitesTypes())
    try {
      const inviteTypeResult = (await client.service('invite-type').find()) as Paginated<InviteType>
      dispatch(InviteTypeAction.retrievedInvitesTypes(inviteTypeResult))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export const InviteTypeAction = {
  retrievedInvitesTypes: (inviteType: Paginated<InviteType>) => {
    return {
      type: 'LOAD_INVITE_TYPE' as const,
      total: inviteType.total,
      limit: inviteType.limit,
      invitesType: inviteType.data,
      skip: inviteType.skip
    }
  },
  fetchingInvitesTypes: () => {
    return {
      type: 'FETCHING_RECEIVED_INVITES_TYPES' as const
    }
  }
}

export type InviteTypeActionType = ReturnType<typeof InviteTypeAction[keyof typeof InviteTypeAction]>
