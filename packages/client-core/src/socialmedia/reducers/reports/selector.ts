/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { createSelector } from 'reselect'
const selectState = (state: any): any => state.get('reports')
export const selectTheFeedsState = createSelector([selectState], (reports) => reports)
