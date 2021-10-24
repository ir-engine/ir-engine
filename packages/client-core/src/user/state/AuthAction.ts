import { AuthUser } from '@xrengine/common/src/interfaces/AuthUser'
import { User, UserSetting } from '@xrengine/common/src/interfaces/User'
import { IdentityProvider } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'

export interface EmailLoginForm {
  email: string
  password: string
}

export interface EmailRegistrationForm {
  email: string
  password: string
}

export interface GithubLoginForm {
  email: string
}

export interface LinkedInLoginForm {
  email: string
}

export const AuthAction = {
  actionProcessing: (processing: boolean) => {
    return {
      type: 'ACTION_PROCESSING' as const,
      processing
    }
  },
  loginUserSuccess: (authUser: AuthUser) => {
    return {
      type: 'LOGIN_USER_SUCCESS' as const,
      authUser,
      message: ''
    }
  },
  loginUserError: (err: string) => {
    return {
      type: 'LOGIN_USER_ERROR' as const,
      message: err
    }
  },
  loginUserByGithubSuccess: (message: string) => {
    return {
      type: 'LOGIN_USER_BY_GITHUB_SUCCESS' as const,
      message
    }
  },
  loginUserByGithubError: (message: string) => {
    return {
      type: 'LOGIN_USER_BY_GITHUB_ERROR' as const,
      message
    }
  },
  loginUserByLinkedinSuccess: (message: string) => {
    return {
      type: 'LOGIN_USER_BY_LINKEDIN_SUCCESS' as const,
      message
    }
  },
  loginUserByLinkedinError: (message: string) => {
    return {
      type: 'LOGIN_USER_BY_LINKEDIN_ERROR' as const,
      message
    }
  },
  didLogout: () => {
    return {
      type: 'LOGOUT_USER' as const,
      message: ''
    }
  },
  registerUserByEmailSuccess: (identityProvider: IdentityProvider) => {
    return {
      type: 'REGISTER_USER_BY_EMAIL_SUCCESS' as const,
      identityProvider,
      message: ''
    }
  },
  registerUserByEmailError: (message: string) => {
    return {
      type: 'REGISTER_USER_BY_EMAIL_ERROR' as const,
      message: message
    }
  },
  didVerifyEmail: (result: boolean) => {
    return {
      type: 'DID_VERIFY_EMAIL' as const,
      result
    }
  },
  didResendVerificationEmail: (result: boolean) => {
    return {
      type: 'DID_RESEND_VERIFICATION_EMAIL' as const,
      result
    }
  },
  didForgotPassword: (result: boolean) => {
    return {
      type: 'DID_FORGOT_PASSWORD' as const,
      result
    }
  },
  didResetPassword: (result: boolean) => {
    return {
      type: 'DID_RESET_PASSWORD' as const,
      result
    }
  },
  didCreateMagicLink: (result: boolean) => {
    return {
      type: 'DID_CREATE_MAGICLINK' as const,
      result
    }
  },
  loadedUserData: (user: User) => {
    return {
      type: 'LOADED_USER_DATA' as const,
      user
    }
  },
  updatedUserSettingsAction: (data: UserSetting) => {
    return {
      type: 'UPDATE_USER_SETTINGS' as const,
      data: data
    }
  },
  avatarUpdated: (result: any) => {
    debugger
    const url = result.url
    return {
      type: 'AVATAR_UPDATED' as const,
      url
    }
  },
  usernameUpdated: (result: User) => {
    const name = result.name
    return {
      type: 'USERNAME_UPDATED' as const,
      name
    }
  },
  userAvatarIdUpdated: (result: User) => {
    const avatarId = result.avatarId
    return {
      type: 'USERAVATARID_UPDATED' as const,
      avatarId
    }
  },
  userUpdated: (user: User) => {
    return {
      type: 'USER_UPDATED' as const,
      user: user
    }
  },
  updateAvatarList: (avatarList: AvatarInterface[]) => {
    return {
      type: 'AVATAR_FETCHED' as const,
      avatarList
    }
  },
  restoreAuth: () => {
    return {
      type: 'RESTORE' as const
    }
  }
}

export type AuthActionType = ReturnType<typeof AuthAction[keyof typeof AuthAction]>
