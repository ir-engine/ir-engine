import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminLocation')
}

export const selectAdminLocationState = createSelector([selectState], (adminLocation) => adminLocation)
