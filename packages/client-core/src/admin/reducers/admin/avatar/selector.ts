import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('adminAvatar')
}

export const selectAdminAvatarState = createSelector([selectState], (adminAvatar) => adminAvatar)
