import { InviteResult } from '@xrengine/common/src/interfaces/InviteResult'

export const InviteAction = {
  sentInvite: (id: string) => {
    return {
      type: 'INVITE_SENT' as const,
      id
    }
  },
  retrievedSentInvites: (inviteResult: InviteResult) => {
    return {
      type: 'SENT_INVITES_RETRIEVED' as const,
      invites: inviteResult.data,
      total: inviteResult.total,
      limit: inviteResult.limit,
      skip: inviteResult.skip
    }
  },
  retrievedReceivedInvites: (inviteResult: InviteResult) => {
    return {
      type: 'RECEIVED_INVITES_RETRIEVED' as const,
      invites: inviteResult.data,
      total: inviteResult.total,
      limit: inviteResult.limit,
      skip: inviteResult.skip
    }
  },
  createdReceivedInvite: () => {
    return {
      type: 'CREATED_RECEIVED_INVITE' as const
    }
  },
  removedReceivedInvite: () => {
    return {
      type: 'REMOVED_RECEIVED_INVITE' as const
    }
  },
  createdSentInvite: () => {
    return {
      type: 'CREATED_SENT_INVITE' as const
    }
  },
  removedSentInvite: () => {
    return {
      type: 'REMOVED_SENT_INVITE' as const
    }
  },
  acceptedInvite: () => {
    return {
      type: 'ACCEPTED_INVITE' as const
    }
  },
  declinedInvite: () => {
    return {
      type: 'DECLINED_INVITE' as const
    }
  },
  setInviteTarget: (targetObjectType: string, targetObjectId: string) => {
    return {
      type: 'INVITE_TARGET_SET' as const,
      targetObjectId: targetObjectId,
      targetObjectType: targetObjectType
    }
  },
  fetchingSentInvites: () => {
    return {
      type: 'FETCHING_SENT_INVITES' as const
    }
  },
  fetchingReceivedInvites: () => {
    return {
      type: 'FETCHING_RECEIVED_INVITES' as const
    }
  }
}

export type InviteActionType = ReturnType<typeof InviteAction[keyof typeof InviteAction]>
