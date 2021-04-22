/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('arMedia');
export const selectAdMediaState = createSelector([selectState], (arMedia) => arMedia);
