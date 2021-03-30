import {  createSelector } from "reselect";


const selectState = (state: any ): any =>{
    console.log(state.get('inviteType'));
    
    return state.get('inviteType');
};
export const selectInviteTypesState = createSelector([selectState], (inviteType) => inviteType);