import { createState, useState, none, Downgraded } from '@hookstate/core'
import { InviteActionType } from './InviteActions'
export const INVITE_PAGE_LIMIT = 10

const state = createState({
  receivedInvites: {
    invites: [],
    skip: 0,
    limit: 5,
    total: 0
  },
  sentInvites: {
    invites: [],
    skip: 0,
    limit: 5,
    total: 0
  },
  sentUpdateNeeded: true,
  receivedUpdateNeeded: true,
  getSentInvitesInProgress: false,
  getReceivedInvitesInProgress: false,
  targetObjectId: '',
  targetObjectType: ''
})

export const inviteReducer = (_, action: InviteActionType) => {
  Promise.resolve().then(() => inviteReceptor(action))
  return state.attach(Downgraded).value
}

const inviteReceptor = (action: InviteActionType): any => {
  let newValues
  state.batch((s) => {
    switch (action.type) {
      case 'INVITE_SENT':
        return s.sentUpdateNeeded.set(true)
      case 'SENT_INVITES_RETRIEVED':
        newValues = action
        s.sentInvites.merge({
          invites: newValues.invites,
          skip: newValues.skip,
          limit: newValues.limit,
          total: newValues.total
        })
        return s.merge({ sentUpdateNeeded: false, getSentInvitesInProgress: false })
      case 'RECEIVED_INVITES_RETRIEVED':
        newValues = action
        const receivedInvites = s.receivedInvites.invites.value

        if (receivedInvites.size != null || s.receivedUpdateNeeded.value === true) {
          s.receivedInvites.invites.set(newValues.invites)
        } else {
          s.receivedInvites.invites.merge(newValues.invites)
        }
        s.receivedInvites.merge({ skip: newValues.skip, limit: newValues.limit, total: newValues.total })
        return s.merge({ receivedUpdateNeeded: false, getReceivedInvitesInProgress: false })
      case 'CREATED_RECEIVED_INVITE':
        return s.receivedUpdateNeeded.set(true)
      case 'CREATED_SENT_INVITE':
        return s.sentUpdateNeeded.set(true)
      case 'REMOVED_RECEIVED_INVITE':
        return s.receivedUpdateNeeded.set(true)
      case 'REMOVED_SENT_INVITE':
        return s.sentUpdateNeeded.set(true)
      case 'ACCEPTED_INVITE':
        return s.receivedUpdateNeeded.set(true)
      case 'DECLINED_INVITE':
        return s.receivedUpdateNeeded.set(true)
      case 'INVITE_TARGET_SET':
        newValues = action
        return state.merge({
          targetObjectId: newValues.targetObjectId || '',
          targetObjectType: newValues.targetObjectType || ''
        })
      case 'FETCHING_SENT_INVITES':
        return s.getSentInvitesInProgress.set(true)
      case 'FETCHING_RECEIVED_INVITES':
        return s.getReceivedInvitesInProgress.set(true)
    }
  }, action.type)
}

export const accessInviteState = () => state
export const useInviteState = () => useState(state) as any as typeof state
