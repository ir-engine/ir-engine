import Immutable from 'immutable';
import { 
    AuthAction,
    AuthProcessingAction,
    LoginResultAction,
    AuthState,
    AuthResultAction
} from "./actions";

import { 
    LOGIN_USER_BY_GITHUB_SUCCESS,
    LOGIN_USER_BY_GITHUB_ERROR,
    LOGIN_USER_SUCCESS,
    LOGIN_USER_ERROR,
    LOGOUT_USER,
    REGISTER_USER_BY_EMAIL_SUCCESS,
    ACTION_PROCESSING,
    DID_VERIFY_EMAIL,
    REGISTER_USER_BY_EMAIL_ERROR,
    RESTORE,
} from "../actions";
import { getStoredState } from '../persisted.store';
// import { getStoredState } from '../persisted.store';

export const initialState: AuthState = {
    isLoggedIn: false,
    isVerified: true,
    user: undefined,
    error: '',

    isProcessing: false
};

const immutableState = Immutable.fromJS(initialState);

const authReducer = (state = immutableState, action: AuthAction): any => {
    switch(action.type) {
        case ACTION_PROCESSING:
            return state
                .set('isProcessing', (action as AuthProcessingAction).processing);
        case LOGIN_USER_SUCCESS:
            console.log('succeed---', (action as LoginResultAction).user);
            return state
                .set('isLoggedIn', true)
                .set('user', (action as LoginResultAction).user);
        case LOGIN_USER_ERROR:
            return state
                .set('error', (action as LoginResultAction).message);
        case LOGIN_USER_BY_GITHUB_SUCCESS:
            break;
        case LOGIN_USER_BY_GITHUB_ERROR:
            return state
                .set('error', (action as LoginResultAction).message);
        case REGISTER_USER_BY_EMAIL_SUCCESS:
            console.log('registered--------', action);
            break;
        case REGISTER_USER_BY_EMAIL_ERROR:
            break;
        case LOGOUT_USER:
            console.log('logout-------------');
            return state
                .set('isLoggedIn', false)
                .set('user', undefined);
        case DID_VERIFY_EMAIL:
            return state
                .set('isVerified', (action as AuthResultAction).result);
        case RESTORE: {
            const stored = getStoredState("auth");
            console.log('-----------restore auth---------', stored);
    
            if (stored) {
                return state
                    .set('isLogined', stored.isLogined)
                    .set('user', stored.user);
            }
            return state;
        }
    }

    return state;
}

export default authReducer;