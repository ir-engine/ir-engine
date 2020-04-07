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
    LOGIN_PROCESSING,
    LOGOUT_PROCESSING,
    REGISTER_USER_BY_EMAIL_SUCCESS,
} from "../actions";

export const initialState: AuthState = {
    isLogined: false,
    user: undefined,
    error: '',

    isLogining: false,
    isRegistering: false,
    isLogouting: false
};

const immutableState = Immutable.fromJS(initialState);

const authReducer = (state = immutableState, action: AuthAction): any => {
    switch(action.type) {
        case LOGIN_PROCESSING:
            return state
                .set('isLogining', (action as AuthProcessingAction).processing);
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
        case LOGOUT_PROCESSING:
            return state
                .set('isLogouting', (action as AuthProcessingAction).processing);
        case LOGOUT_USER:
            console.log('logout-------------');
            return state
                .set('isLogined', false)
                .set('user', undefined);
    }

    return state;
}

export default authReducer;