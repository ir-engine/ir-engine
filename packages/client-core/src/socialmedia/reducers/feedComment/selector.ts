/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('feedComments')
export const selectFeedCommentsState = createSelector([selectState], (feedComments) => feedComments)
