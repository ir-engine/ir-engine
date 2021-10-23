import { Party } from '@xrengine/common/src/interfaces/Party'
import { PartyResult } from '@xrengine/common/src/interfaces/PartyResult'
import { PartyUser } from '@xrengine/common/src/interfaces/PartyUser'

export const PartyAction = {
  loadedParty: (partyResult: PartyResult) => {
    return {
      type: 'LOADED_PARTY' as const,
      party: partyResult
    }
  },
  createdParty: (party: Party) => {
    return {
      type: 'CREATED_PARTY' as const,
      party: party
    }
  },
  patchedParty: (party: Party) => {
    return {
      type: 'PATCHED_PARTY' as const,
      party: party
    }
  },
  removedParty: (party: Party) => {
    return {
      type: 'REMOVED_PARTY' as const,
      party: party
    }
  },
  invitedPartyUser: () => {
    return {
      type: 'INVITED_PARTY_USER' as const
    }
  },
  leftParty: () => {
    return {
      type: 'LEFT_PARTY' as const
    }
  },
  createdPartyUser: (partyUser: PartyUser) => {
    return {
      type: 'CREATED_PARTY_USER' as const,
      partyUser: partyUser
    }
  },
  patchedPartyUser: (partyUser: PartyUser) => {
    return {
      type: 'PATCHED_PARTY_USER' as const,
      partyUser: partyUser
    }
  },
  removedPartyUser: (partyUser: PartyUser) => {
    return {
      type: 'REMOVED_PARTY_USER' as const,
      partyUser: partyUser
    }
  }
}

export type PartyActionType = ReturnType<typeof PartyAction[keyof typeof PartyAction]>
