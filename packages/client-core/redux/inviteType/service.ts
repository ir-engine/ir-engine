import { Dispatch } from 'redux';
import { client } from '../feathers';
import {dispatchAlertSuccess} from '../alert/service';
import {
    fetchingInvitesTypes,
   retrievedInvitesTypes
} from "./actions";
import {dispatchAlertError} from '../alert/service';
import store from "../store";

export function retrieveInvites () {
    return async (dispatch: Dispatch, getState: any): Promise<any> => {
        dispatch(fetchingInvitesTypes());
        try {
            const inviteTypeResult = await client.service('invite-type').find();
            dispatch(retrievedInvitesTypes(inviteTypeResult));
        } catch (err) {
            console.log(err);
            dispatchAlertError(dispatch, err.message);
        }
    };
}