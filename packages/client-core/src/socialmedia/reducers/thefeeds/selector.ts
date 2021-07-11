/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { createSelector } from 'reselect'
const selectState = (state: any): any => state.get('thefeeds')
export const selectTheFeedsState = createSelector([selectState], (thefeeds) => thefeeds)
