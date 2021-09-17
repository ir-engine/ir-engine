import { createSelector } from 'reselect'

const selectState = (state: any): any => {
  return state.get('scopeError')
}
export const selectScopeErrorState = createSelector([selectState], (scopeError) => scopeError)
