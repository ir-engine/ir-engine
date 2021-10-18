export const PartyAction = {
  partyAdminCreated: (data: any) => {
    return {
      type: 'PARTY_ADMIN_CREATED' as const,
      data: data
    }
  },
  partyRetrievedAction: (data: any) => {
    return {
      type: 'PARTY_ADMIN_DISPLAYED' as const,
      data: data
    }
  }
}
export type PartyActionType = ReturnType<typeof PartyAction[keyof typeof PartyAction]>
