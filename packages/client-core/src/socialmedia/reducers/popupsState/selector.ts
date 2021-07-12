/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('popups')
export const selectPopupsState = createSelector([selectState], (popups) => popups)
