/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('tips_and_tricks')
export const selectTipsAndTricksState = createSelector([selectState], (tips_and_tricks) => tips_and_tricks)
