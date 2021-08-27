/**
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('group')
export const selectGroupState = createSelector([selectState], (group) => group)
