import { InviteResult } from '@xrengine/common/src/interfaces/InviteResult'

export const InviteTypeAction = {
  retrievedInvitesTypes: (inviteType: InviteResult) => {
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
