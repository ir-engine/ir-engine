import Immutable from 'immutable';
import { 
    AuthAction,
    AuthProcessingAction,
    LoginResultAction,
    AuthState
} from "./actions";

import { 
    LOGIN_USER_BY_GITHUB_SUCCESS,
    LOGIN_USER_BY_GITHUB_ERROR,
    LOGIN_USER_BY_EMAIL_SUCCESS,
    LOGIN_USER_BY_EMAIL_ERROR,
    LOGOUT_USER,
    REGISTER_USER_BY_EMAIL_SUCCESS,
    ACTION_PROCESSING,
} from "../actions";

export const initialState: AuthState = {
    isLogined: false,
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
        case LOGIN_USER_BY_EMAIL_SUCCESS:
            return state
                .set('isLogined', true)
                .set('user', (action as LoginResultAction).user);
        case LOGIN_USER_BY_EMAIL_ERROR:
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
        case LOGOUT_USER:
            console.log('logout-------------');
            return state
                .set('isLogined', false)
                .set('user', undefined);
    }

    return state;
}

export default authReducer;