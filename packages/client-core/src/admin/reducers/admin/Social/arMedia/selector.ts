/**
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('arMedia')
export const selectArMediaState = createSelector([selectState], (arMedia) => arMedia)
