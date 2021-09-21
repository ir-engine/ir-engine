import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('transport')
export const selectTransportState = createSelector([selectState], (transport) => transport)
