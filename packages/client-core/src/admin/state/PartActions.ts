import { AdminPartyResult } from '@xrengine/common/src/interfaces/AdminPartyResult'
import { AdminParty } from '@xrengine/common/src/interfaces/AdminParty'

export const PartyAction = {
  partyAdminCreated: (data: AdminParty) => {
    return {
      type: 'PARTY_ADMIN_CREATED' as const,
      data: data
    }
  },
  partyRetrievedAction: (data: AdminPartyResult) => {
    return {
      type: 'PARTY_ADMIN_DISPLAYED' as const,
      data: data
    }
  }
}
export type PartyActionType = ReturnType<typeof PartyAction[keyof typeof PartyAction]>
