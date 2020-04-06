import {
    LOGIN_USER_BY_GITHUB_ERROR,
    LOGIN_USER_BY_GITHUB_SUCCESS,

    LOGIN_USER_BY_EMAIL_SUCCESS,
    LOGIN_USER_BY_EMAIL_ERROR,

    LOGOUT_USER,
    LOGIN_PROCESSING,
    REGISTER_USER_BY_EMAIL_ERROR,
    REGISTER_USER_BY_EMAIL_SUCCESS,
    REGISTER_PROCESSING
} from '../actions';

export interface AuthState {
    is_logined: boolean;
    user: any;
    error: string;
}

export interface EmailLoginForm {
    email: string | undefined;
}

export interface EmailRegistrationForm {
    email: string | undefined;
}

export interface GithubLoginForm {
    email: string;
}

export interface GithubLoginAction {
    type: string;
    payload: GithubLoginForm;
}

export interface LoginProcessingAction {
    type: string;
    processing: boolean;
}

export interface GithubLoginResultAction {
    type: string;
    user?: any;
    message: string;
}

export type LoginAction = 
    GithubLoginAction 
    | GithubLoginResultAction
    | LoginProcessingAction;

export function loginProcessing(processing: boolean): LoginAction {
    return {
        type: LOGIN_PROCESSING,
        processing
    }
}

export function loginUserByEmailSuccess(user: any): LoginAction {
    return {
        type: LOGIN_USER_BY_EMAIL_SUCCESS,
        user,
        message: ''
    }
}

export function loginUserByEmailError(): LoginAction {
    return {
        type: LOGIN_USER_BY_EMAIL_ERROR,
        message: ''
    }
}

export function loginUserByGithubSuccess(message: string): LoginAction {
    return {
        type: LOGIN_USER_BY_GITHUB_SUCCESS,
        message
    }
}

export function loginUserByGithubError(message: string): LoginAction {
    return {
        type: LOGIN_USER_BY_GITHUB_ERROR,
        message
    }
}

export function logoutProcessing(processing: boolean): LoginAction {
    return {
        type: LOGIN_PROCESSING,
        processing
    }
}

export function logoutUser(): LoginAction {
    return {
        type: LOGOUT_USER,
        message: ''
    }
}

export function registerProcessing(processing: boolean): LoginAction {
    return {
        type: REGISTER_PROCESSING,
        processing
    }
}

export function registerUserByEmailSuccess(user: any): LoginAction {
    return {
        type: REGISTER_USER_BY_EMAIL_SUCCESS,
        user,
        message: ''
    }
}

export function registerUserByEmailError(): LoginAction {
    return {
        type: REGISTER_USER_BY_EMAIL_ERROR,
        message: ''
    }
}