import {
    LOGIN_USER_BY_GITHUB_ERROR,
    LOGIN_USER_BY_GITHUB_SUCCESS,

    LOGIN_USER_SUCCESS,
    LOGIN_USER_ERROR,

    LOGOUT_USER,
    REGISTER_USER_BY_EMAIL_ERROR,
    REGISTER_USER_BY_EMAIL_SUCCESS,
    DID_VERIFY_EMAIL,
    DID_RESEND_VERIFICATION_EMAIL,
    DID_FORGOT_PASSWORD,
    DID_RESET_PASSWORD,
    ACTION_PROCESSING
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
        isVerified: boolean;
    }
}

export interface AuthState {
    isLogined: boolean;
    isVerified: boolean;
    
    user: AuthUser | undefined;
    error: string;

    isProcessing: boolean;
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

export interface AuthResultAction {
    type: string;
    result: boolean;
}

export type AuthAction = 
    AuthProcessingAction
    | LoginResultAction
    | RegistrationResultAction
    | AuthResultAction;

export function actionProcessing(processing: boolean): AuthProcessingAction {
    return {
        type: ACTION_PROCESSING,
        processing
    }
}

export function loginUserSuccess(user: AuthUser): LoginResultAction {
    return {
        type: LOGIN_USER_SUCCESS,
        user,
        message: ''
    }
}

export function loginUserError(err: string): LoginResultAction {
    return {
        type: LOGIN_USER_ERROR,
        message: err
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

export function didLogout(): LoginResultAction {
    return {
        type: LOGOUT_USER,
        message: ''
    }
}

export function registerUserByEmailSuccess(user: any): RegistrationResultAction {
    return {
        type: REGISTER_USER_BY_EMAIL_SUCCESS,
        user,
        message: ''
    }
}

export function registerUserByEmailError(message: string): RegistrationResultAction {
    return {
        type: REGISTER_USER_BY_EMAIL_ERROR,
        message: message
    }
}

export function didVerifyEmail(result: boolean): AuthResultAction {
    return {
        type: DID_VERIFY_EMAIL,
        result
    }
}

export function didResendVerificationEmail(result: boolean): AuthResultAction {
    return {
        type: DID_RESEND_VERIFICATION_EMAIL,
        result
    }
}

export function didForgotPassword(result: boolean): AuthResultAction {
    return {
        type: DID_FORGOT_PASSWORD,
        result
    }
}

export function didResetPassword(result: boolean): AuthResultAction {
    return {
        type: DID_RESET_PASSWORD,
        result
    }
}
