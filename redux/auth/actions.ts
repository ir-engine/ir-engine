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

export interface AuthUser {
    accessToken: string;
    authentication: {
        strategy: string;
    },
    user: {
        _id: string;
        userId: string;
        avatar: string;
    }
}

export interface AuthState {
    isLogined: boolean;
    user: AuthUser | undefined;
    error: string;

    isLogining: boolean;
    isRegistering: boolean;
    isLogouting: boolean;
}

export interface EmailLoginForm {
    email: string;
    password: string;
}

export interface EmailRegistrationForm {
    email: string;
    password: string;
}

export interface GithubLoginForm {
    email: string;
}

export interface AuthProcessingAction {
    type: string;
    processing: boolean;
}

export interface LoginResultAction {
    type: string;
    user?: any;
    message: string;
}

export interface RegistrationResultAction {
    type: string;
    user?: any;
    message: string;
}

export type AuthAction = 
    AuthProcessingAction
    | LoginResultAction
    | RegistrationResultAction;

export function loginProcessing(processing: boolean): AuthProcessingAction {
    return {
        type: LOGIN_PROCESSING,
        processing
    }
}

export function loginUserByEmailSuccess(user: AuthUser): LoginResultAction {
    return {
        type: LOGIN_USER_BY_EMAIL_SUCCESS,
        user,
        message: ''
    }
}

export function loginUserByEmailError(): LoginResultAction {
    return {
        type: LOGIN_USER_BY_EMAIL_ERROR,
        message: ''
    }
}

export function loginUserByGithubSuccess(message: string): LoginResultAction {
    return {
        type: LOGIN_USER_BY_GITHUB_SUCCESS,
        message
    }
}

export function loginUserByGithubError(message: string): LoginResultAction {
    return {
        type: LOGIN_USER_BY_GITHUB_ERROR,
        message
    }
}

export function logoutProcessing(processing: boolean): AuthProcessingAction {
    return {
        type: LOGIN_PROCESSING,
        processing
    }
}

export function logoutUser(): LoginResultAction {
    return {
        type: LOGOUT_USER,
        message: ''
    }
}

export function registerProcessing(processing: boolean): AuthProcessingAction {
    return {
        type: REGISTER_PROCESSING,
        processing
    }
}

export function registerUserByEmailSuccess(user: any): RegistrationResultAction {
    return {
        type: REGISTER_USER_BY_EMAIL_SUCCESS,
        user,
        message: ''
    }
}

export function registerUserByEmailError(): RegistrationResultAction {
    return {
        type: REGISTER_USER_BY_EMAIL_ERROR,
        message: ''
    }
}