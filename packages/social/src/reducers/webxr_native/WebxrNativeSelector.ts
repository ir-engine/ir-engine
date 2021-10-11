/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { createSelector } from 'reselect'

const selectState = (state: any): any => state.get('webxrnative')
export const selectWebXrNativeState = createSelector([selectState], (webxrnative) => webxrnative)
