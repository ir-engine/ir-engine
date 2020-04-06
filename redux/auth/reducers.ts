import { 
    AuthState,
    LoginAction,
    GithubLoginAction,
    GithubLoginResultAction,
} from "./actions";

import { 
    LOGIN_USER_BY_GITHUB_SUCCESS,
    LOGIN_USER_BY_GITHUB_ERROR,
    LOGIN_USER_BY_EMAIL_SUCCESS,
    LOGIN_USER_BY_EMAIL_ERROR,
    LOGOUT_USER,
    LOGIN_PROCESSING,
    LOGOUT_PROCESSING
} from "../actions";

const initialState: AuthState = {
    is_logined: false,
    user: null,
    error: ''
};

const authReducer = (state = initialState, action: LoginAction): AuthState => {
    switch(action.type) {
        case LOGIN_PROCESSING:
            return {
                ...state
            }
        case LOGIN_USER_BY_EMAIL_SUCCESS:
            return {
                ...state
            }
        case LOGIN_USER_BY_EMAIL_ERROR:
            return {
                ...state
            }
        case LOGIN_USER_BY_GITHUB_SUCCESS:
            return {
                ...state
            }
        case LOGIN_USER_BY_GITHUB_ERROR:
            return {
                ...state,
                error: (action as GithubLoginResultAction).message
            }

        case LOGOUT_PROCESSING:
            return {
                ...state
            }
        case LOGOUT_USER:
            return {
                ...state
            }
    }

    return state;
}

export default authReducer;