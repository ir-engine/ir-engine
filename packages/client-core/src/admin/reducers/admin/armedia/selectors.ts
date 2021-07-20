import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminArmedia')
}
export const selectAdminArmediaState = createSelector([selectState], (adminArmedia) => adminArmedia)
