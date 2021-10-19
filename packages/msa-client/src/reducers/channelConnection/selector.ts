import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('channelConnection')
export const selectChannelConnectionState = createSelector([selectState], (channelConnection) => channelConnection)
