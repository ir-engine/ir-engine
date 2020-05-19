import { createSelector } from 'reselect'

const selectState = (state: any) => state.get('app')
export const selectAppState = createSelector([selectState], app => app)

const selectInVrModeFn = (state: any) => state.getIn(['app', 'inVrMode'])
export const selectInVrModeState = createSelector([selectInVrModeFn], inVrMode => inVrMode)
