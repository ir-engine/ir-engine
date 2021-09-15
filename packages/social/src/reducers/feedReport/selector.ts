/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('feedReport')
export const selectFeedReportState = createSelector([selectState], (feedReport) => feedReport)
