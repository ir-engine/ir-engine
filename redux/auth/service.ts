import { Dispatch } from "redux"
import {
  EmailLoginForm,
  EmailRegistrationForm,
  didLogout,
  loginUserSuccess,
  AuthUser,
  loginUserError,
  registerUserByEmailSuccess,
  registerUserByEmailError,
  didVerifyEmail,
  actionProcessing,
  didResendVerificationEmail,
  didForgotPassword,
  didResetPassword,
  didCreateMagicLink
} from "./actions"
import { client } from "../feathers"
import { dispatchAlertError, dispatchAlertSuccess } from "../alert/service"
import getConfig from 'next/config'
import { validateEmail, validatePhoneNumber } from "../helper"

const { publicRuntimeConfig } = getConfig()
const apiServer: string = publicRuntimeConfig.apiServer
const authConfig = publicRuntimeConfig.auth

export function doLoginAuto() {
  return (dispatch: Dispatch) => {
    client.reAuthenticate()
      .then((res: any) => {
        const val = res as AuthUser
        if (!val.user.isVerified) {
          client.logout()

          dispatchAlertError(dispatch, 'Unverified user')

          return dispatch(loginUserError('Unverified user'))
        }
        return dispatch(loginUserSuccess(val))
      })
  }
}

export function loginUserByEmail(form: EmailLoginForm) {
  return (dispatch: Dispatch) => {
    // check email validation.
    if (!validateEmail(form.email)) {
      dispatchAlertError(dispatch, 'Please input valid email address')

      return;
    }

    dispatch(actionProcessing(true))

    client.authenticate({
      strategy: 'local',
      email: form.email,
      password: form.password
    })
      .then((res: any) => {
        const val = {
          accessToken: res.accessToken,
          authentication: res.authentication,
          user: res['identity-provider']
        }

        if (!val.user.isVerified) {
          client.logout()
          window.location.href = '/auth/confirm'

          dispatchAlertError(dispatch, 'Unverified user')

          return dispatch(loginUserError('Unverified user'))
        }
        window.location.href = '/'
        return dispatch(loginUserSuccess(val))
      })
      .catch((err: any) => {
        console.log(err)

        dispatchAlertError(dispatch, err.message)

        dispatch(loginUserError('Failed to login'))
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function loginUserByGithub() {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    window.location.href = `${apiServer}/oauth/github`
  }
}

export function loginUserByGoogle() {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    window.location.href = `${apiServer}/oauth/google`
  }
}

export function loginUserByFacebook() {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    window.location.href = `${apiServer}/oauth/facebook`
  }
}

export function loginUserByJwt(accessToken: string, redirectSuccess: string, redirectError: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    client.authenticate({
      strategy: 'jwt',
      accessToken
    })
      .then((res: any) => {
        const val = {
          accessToken: res.accessToken,
          authentication: res.authentication,
          user: res['identity-provider']
        }

        window.location.href = redirectSuccess
        return dispatch(loginUserSuccess(val))
      })
      .catch((err: any) => {
        window.location.href = redirectError
        console.log(err)

        dispatchAlertError(dispatch, err.message)

        return dispatch(loginUserError('Failed to login'))
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function logoutUser() {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))
    client.logout()
      .then(() => dispatch(didLogout()))
      .catch(() => dispatch(didLogout()))
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function registerUserByEmail(form: EmailRegistrationForm) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    client.service('identity-provider').create({
      token: form.email,
      password: form.password,
      accountType: 'password'
    })
      .then((user: any) => {
        window.location.href = '/auth/confirm'
        dispatch(registerUserByEmailSuccess(user))
      })
      .catch((err: any) => {
        console.log(err)

        dispatchAlertError(dispatch, err.message)

        dispatch(registerUserByEmailError(err.message))
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function verifyEmail(token: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    client.service('authManagement').create({
      action: 'verifySignupLong',
      value: token
    })
      .then((res: any) => {
        console.log('accc-----------====', res.accessToken)
        loginUserByJwt(res.accessToken, "/", "/")(dispatch)
        dispatch(didVerifyEmail(true))
      })
      .catch((err: any) => {
        console.log(err)

        dispatchAlertError(dispatch, err.message)

        dispatch(didVerifyEmail(false))
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function resendVerificationEmail(email: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    client.service('authManagement').create({
      action: 'resendVerifySignup',
      value: { token: email, accountType: 'password' }
    })
      .then(() => dispatch(didResendVerificationEmail(true)))
      .catch(() => dispatch(didResendVerificationEmail(false)))
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function forgotPassword(email: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    client.service('authManagement').create({
      action: 'sendResetPwd',
      value: { token: email, accountType: 'password' }
    })
      .then(() => dispatch(didForgotPassword(true)))
      .catch(() => dispatch(didForgotPassword(false)))
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function resetPassword(token: string, password: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    client.service('authManagement').create({
      action: 'resetPwdLong',
      value: { token, password }
    })
      .then((res: any) => {
        console.log(res)
        window.location.href = '/auth/login'
        dispatch(didResetPassword(true))
      })
      .catch((err: any) => {
        console.log(err)
        window.location.href = '/auth/login'
        dispatch(didResetPassword(false))
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function createMagicLink(email_phone: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true))

    let type = "email"
    let paramName = "email"
    const isEnableEmailMagicLink = (authConfig && authConfig.isEnableEmailMagicLink) ?? true;
    const isEnableSmsMagicLink = (authConfig && authConfig.isEnableSmsMagicLink) ?? false;

    if (validatePhoneNumber(email_phone)) {
      if (!isEnableSmsMagicLink) {
        dispatchAlertError(dispatch, 'Please input valid email address')

        return;
      }
      type = "sms"
      paramName = "mobile"
    }
    else if (validateEmail(email_phone)) {
      if (!isEnableEmailMagicLink) {
        dispatchAlertError(dispatch, 'Please input valid phone number')

        return;
      }
      type = "email"
    }
    else {
      dispatchAlertError(dispatch, 'Please input valid email or phone number')

      return;
    }

    console.log('create----', email_phone, type);

    client.service('magiclink').create({
      type,
      [paramName]: email_phone
    })
      .then((res: any) => {
        console.log(res)

        dispatchAlertSuccess(dispatch, 'Login Magic Link was sent. Please check your Email or SMS.')

        dispatch(didCreateMagicLink(true))
      })
      .catch((err: any) => {
        console.log(err)

        dispatchAlertError(dispatch, err.message)

        dispatch(didCreateMagicLink(false))
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}
