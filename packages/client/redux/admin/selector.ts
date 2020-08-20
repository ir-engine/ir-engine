import { createSelector } from 'reselect';

const selectState = (state: any): any => state.get('admin');
export const selectAdminState = createSelector([selectState], (admin) => admin);
