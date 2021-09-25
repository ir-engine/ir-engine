import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminRealityPack')
}

export const selectAdminRealityPackState = createSelector([selectState], (adminRealityPack) => adminRealityPack)
