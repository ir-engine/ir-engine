/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { createSelector } from 'reselect'

// thefeeds
// TheFeeds
// THEFEEDS

const selectState = (state: any): any => state.get('thefeedsFires')
export const selectTheFeedsFiresState = createSelector([selectState], (thefeedsFires) => thefeedsFires)
