import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('app');
export const selectAppState = createSelector([selectState], app => app);

const selectLoadPercent = (state: any): any => state.getIn(['app', 'loadPercent']);
export const selectAppLoadPercent = createSelector([selectLoadPercent], loadPercent => loadPercent);

const selectInVrModeFn = (state: any): any => state.getIn(['app', 'inVrMode']);
export const selectInVrModeState = createSelector([selectInVrModeFn], inVrMode => inVrMode);

const selectOnBoardingStep = (state: any): any => state.getIn(['app', 'onBoardingStep']);
export const selectAppOnBoardingStep = createSelector([selectOnBoardingStep], onBoardingStep => onBoardingStep);

const selectIsTutorial = (state: any): any => state.getIn(['app', 'isTutorial']);
export const selectAppIsTutorial = createSelector([selectIsTutorial], isTutorial => isTutorial);