import Immutable from 'immutable';
import { 
    AuthState,
    AuthAction,
    AuthProcessingAction,
    LoginResultAction
} from "./actions";

import { 
    LOGIN_USER_BY_GITHUB_SUCCESS,
    LOGIN_USER_BY_GITHUB_ERROR,
    LOGIN_USER_BY_EMAIL_SUCCESS,
    LOGIN_USER_BY_EMAIL_ERROR,
    LOGOUT_USER,
    LOGIN_PROCESSING,
    LOGOUT_PROCESSING,
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
            state.set('isLogining', (action as AuthProcessingAction).processing);
            break;
        case LOGIN_USER_BY_EMAIL_SUCCESS:
            state.set('user', (action as LoginResultAction).user);
            break;
        case LOGIN_USER_BY_EMAIL_ERROR:
            state.set('error', (action as LoginResultAction).message);
            break;
        case LOGIN_USER_BY_GITHUB_SUCCESS:
            break;
        case LOGIN_USER_BY_GITHUB_ERROR:
            state.set('error', (action as LoginResultAction).message);
            break;
        case LOGOUT_PROCESSING:
            state.set('isLogouting', (action as AuthProcessingAction).processing);
            break;
        case LOGOUT_USER:
            state
                .set('isLogined', false)
                .set('user', undefined);
            break;
    }

    return state;
}

export default authReducer;