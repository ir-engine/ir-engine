import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminParty')
}

export const selectAdminPartyState = createSelector([selectState], (adminParty) => adminParty)
