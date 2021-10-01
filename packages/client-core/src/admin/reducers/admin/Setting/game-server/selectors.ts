import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('gameServer')
}

export const selectGameServerSettingState = createSelector([selectState], (gameServer) => gameServer)
