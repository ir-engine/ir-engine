import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('scenes');
export const selectScenesState = createSelector([selectState], (scenes) => scenes);

const selectCurrentScene = (state: any): any => state.getIn(['scenes', 'currentScene']);
export const selectScenesCurrentScene = createSelector([selectCurrentScene], currentScene => currentScene);