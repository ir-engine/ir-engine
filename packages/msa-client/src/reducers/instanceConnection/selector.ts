import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('instanceConnection')
export const selectInstanceConnectionState = createSelector([selectState], (instanceConnection) => instanceConnection)
