import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('invitesTypeData')
}

export const selectInviteTypesState = createSelector([selectState], (inviteType) => inviteType)
