/**
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('scope')
export const selectScopeState = createSelector([selectState], (scope) => scope)
