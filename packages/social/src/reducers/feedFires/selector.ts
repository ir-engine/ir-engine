/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('feedFires')
export const selectFeedFiresState = createSelector([selectState], (feedFires) => feedFires)
