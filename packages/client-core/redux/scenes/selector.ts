import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('scenes');
export const selectScenesState = createSelector([selectState], (scenes) => scenes);

const selectCurrentSceneObject = (state: any): any => state.getIn(['scenes', 'currentScene']);
export const selectCurrentScene = createSelector([selectCurrentSceneObject], currentScene => currentScene);