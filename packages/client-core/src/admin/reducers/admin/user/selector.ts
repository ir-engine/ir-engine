import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminUser')
}
export const selectAdminUserState = createSelector([selectState], (adminUser) => adminUser)
