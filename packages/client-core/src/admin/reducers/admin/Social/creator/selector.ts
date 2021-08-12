/**
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */

import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('adminCreator')
export const selectCreatorsState = createSelector([selectState], (adminCreator) => adminCreator)
