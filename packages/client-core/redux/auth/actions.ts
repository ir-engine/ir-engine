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
  ACTION_PROCESSING,
  DID_CREATE_MAGICLINK,
  UPDATE_USER_SETTINGS,
  UPDATE_GRAPHICS_SETTINGS,
  LOADED_USER_DATA,
  AVATAR_UPDATED,
  USERNAME_UPDATED,
  USERAVATARID_UPDATED,
  USER_UPDATED
} from '../actions';
import { AuthUser } from '@xr3ngine/common/interfaces/AuthUser';
import { User } from '@xr3ngine/common/interfaces/User';
import { IdentityProvider } from '@xr3ngine/common/interfaces/IdentityProvider';

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

export interface AddConnectionProcessingAction {
  type: string;
  processing: boolean;
  userId: string;
}

export interface LoginResultAction {
  type: string;
  authUser?: AuthUser;
  message: string;
}

export interface RegistrationResultAction {
  type: string;
  identityProvider?: IdentityProvider;
  message: string;
}

export interface AuthResultAction {
  type: string;
  result: boolean;
}

export interface AddConnectionResultAction {
  type: string;
  user?: any;
  message?: string;
}

export interface LoadDataResultAction {
  type: string;
  user?: User;
}

export interface AvatarUpdatedAction {
  type: string;
  url: string;
}

export interface UsernameUpdatedAction {
  type: string;
  name: any;
}
export interface UserAvatarIdUpdatedAction{
  type: string;
  avatarId: any;
}

export interface UserUpdatedAction {
  type: string;
  user: User;
}

export interface UserSettingsUpdatedAction {
  type: string;
  data: any;
}

export type AuthAction =
  AuthProcessingAction
  | LoginResultAction
  | RegistrationResultAction
  | AuthResultAction
  | AddConnectionResultAction
  | AddConnectionProcessingAction
  | LoadDataResultAction

export function actionProcessing (processing: boolean): AuthProcessingAction {
  return {
    type: ACTION_PROCESSING,
    processing
  };
}

export function loginUserSuccess (authUser: AuthUser): LoginResultAction {
  return {
    type: LOGIN_USER_SUCCESS,
    authUser,
    message: ''
  };
}

export function loginUserError (err: string): LoginResultAction {
  return {
    type: LOGIN_USER_ERROR,
    message: err
  };
}

export function loginUserByGithubSuccess (message: string): LoginResultAction {
  return {
    type: LOGIN_USER_BY_GITHUB_SUCCESS,
    message
  };
}

export function loginUserByGithubError (message: string): LoginResultAction {
  return {
    type: LOGIN_USER_BY_GITHUB_ERROR,
    message
  };
}

export function didLogout (): LoginResultAction {
  return {
    type: LOGOUT_USER,
    message: ''
  };
}

export function registerUserByEmailSuccess (identityProvider: IdentityProvider): RegistrationResultAction {
  return {
    type: REGISTER_USER_BY_EMAIL_SUCCESS,
    identityProvider,
    message: ''
  };
}

export function registerUserByEmailError (message: string): RegistrationResultAction {
  return {
    type: REGISTER_USER_BY_EMAIL_ERROR,
    message: message
  };
}

export function didVerifyEmail (result: boolean): AuthResultAction {
  return {
    type: DID_VERIFY_EMAIL,
    result
  };
}

export function didResendVerificationEmail (result: boolean): AuthResultAction {
  return {
    type: DID_RESEND_VERIFICATION_EMAIL,
    result
  };
}

export function didForgotPassword (result: boolean): AuthResultAction {
  return {
    type: DID_FORGOT_PASSWORD,
    result
  };
}

export function didResetPassword (result: boolean): AuthResultAction {
  return {
    type: DID_RESET_PASSWORD,
    result
  };
}

export function didCreateMagicLink (result: boolean): AuthResultAction {
  return {
    type: DID_CREATE_MAGICLINK,
    result
  };
}

export function loadedUserData (user: User): LoadDataResultAction {
  return {
    type: LOADED_USER_DATA,
    user
  };
}

export function updatedUserSettingsAction (data: any): UserSettingsUpdatedAction {
  return {
    type: UPDATE_USER_SETTINGS,
    data: data
  };
}

export function updatedGraphicsSettingsAction (data: any): UserSettingsUpdatedAction {
  return {
    type: UPDATE_GRAPHICS_SETTINGS,
    data: data
  };
}

export function avatarUpdated (result: any): AvatarUpdatedAction {
  const url = result.url;
  return {
    type: AVATAR_UPDATED,
    url
  };
}

export function usernameUpdated (result: any): UsernameUpdatedAction {
  const name = result.name;
  return {
    type: USERNAME_UPDATED,
    name
  };
}

export function userAvatarIdUpdated (result: any): UserAvatarIdUpdatedAction {
  const avatarId = result.avatarId;
  return {
    type: USERAVATARID_UPDATED,
    avatarId
  };
}


export function userUpdated (user: User): UserUpdatedAction {
  return {
    type: USER_UPDATED,
    user: user
  };
}

// export function fileUploadFailure (err: any): VideosFetchedAction {
//   return {
//     type: AVATAR_UPDATE_FAILURE,
//     message: err
//   }
// }
