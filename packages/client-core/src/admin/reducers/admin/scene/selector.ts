import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminScene')
}

export const selectAdminSceneState = createSelector([selectState], (adminScene) => adminScene)
