import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminInstance')
}

export const selectAdminInstanceState = createSelector([selectState], (adminInstance) => adminInstance)
