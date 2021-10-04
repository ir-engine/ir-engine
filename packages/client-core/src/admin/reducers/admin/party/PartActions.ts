export const PartyAction = {
  partyAdminCreated: (data: any) => {
    return {
      type: 'PARTY_ADMIN_CREATED',
      data: data
    }
  },
  partyRetrievedAction: (data: any) => {
    return {
      type: 'PARTY_ADMIN_DISPLAYED',
      data: data
    }
  }
}
export type PartyActionType = ReturnType<typeof PartyAction[keyof typeof PartyAction]>
