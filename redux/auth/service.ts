import { apiServer } from "../../config/server";
import { Dispatch } from "redux";
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
  didResetPassword
} from "./actions";
// import { ajaxPost } from "../service.common";
import { client } from "../feathers";

export function doLoginAuto() {
  return (dispatch: Dispatch) => {
    client.reAuthenticate()
    .then((res: any) => {
      const val = res as AuthUser;
        if (!val.user.isVerified) {
          client.logout();
          return dispatch(loginUserError('Unverified user'));
        }
        return dispatch(loginUserSuccess(val));
    })
  };
}

export function loginUserByEmail(form: EmailLoginForm) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    client.authenticate({
      strategy: 'local',
      email: form.email,
      password: form.password
    })
    .then((res: any) => {
      const val = res as AuthUser;
      if (!val.user.isVerified) {
        client.logout();
        return dispatch(loginUserError('Unverified user'));
      }
      return dispatch(loginUserSuccess(val));
    })
    .catch(() => dispatch(loginUserError('Failed to login')))
    .finally( ()=> dispatch(actionProcessing(false)));
  };
}

export function loginUserByGithub() {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    window.location.href = `${apiServer}/oauth/github`;
  };
}

export function loginUserByGoogle() {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    window.location.href = `${apiServer}/oauth/google`;
  };
}

export function loginUserByFacebook() {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    window.location.href = `${apiServer}/oauth/facebook`;
  };
}

export function loginUserByJwt(accessToken: string, redirectSuccess: string, redirectError: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    client.authenticate({
      strategy: 'jwt',
      accessToken
    })
    .then((res: any) => {
      const val = res as AuthUser;

      window.location.href = redirectSuccess;
      return dispatch(loginUserSuccess(val));
    })
    .catch(() => {
      window.location.href = redirectError;
      return dispatch(loginUserError('Failed to login'))
    })
    .finally( ()=> dispatch(actionProcessing(false)));
  };
}

export function logoutUser() {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));
    client.logout()
      .then(() => dispatch(didLogout()))
      .catch(() => dispatch(didLogout()))
      .finally(() => dispatch(actionProcessing(false)));
  }
}

export function registerUserByEmail(form: EmailRegistrationForm) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    client.service('users').create(form)
      .then((user: any) => dispatch(registerUserByEmailSuccess(user)))
      .catch(() => dispatch(registerUserByEmailError()))
      .finally(() => dispatch(actionProcessing(false)));
  }
}

export function verifyEmail(token: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    client.service('authManagement').create({
      action: 'verifySignupLong',
      value: token
    })
      .then(() => dispatch(didVerifyEmail(true)))
      .catch(() => dispatch(didVerifyEmail(false)))
      .finally(() => dispatch(actionProcessing(false)));
  }
}

export function resendVerificationEmail(email: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    client.service('authManagement').create({
      action: 'resendVerifySignup',
      value: { email }
    })
      .then(() => dispatch(didResendVerificationEmail(true)))
      .catch(() => dispatch(didResendVerificationEmail(false)))
      .finally(() => dispatch(actionProcessing(false)));
  }
}

export function forgotPassword(email: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    client.service('authManagement').create({
      action: 'sendResetPwd',
      value: { email }
    })
      .then(() => dispatch(didForgotPassword(true)))
      .catch(() => dispatch(didForgotPassword(false)))
      .finally(() => dispatch(actionProcessing(false)));
  }
}

export function resetPassword(token: string, password: string) {
  return (dispatch: Dispatch) => {
    dispatch(actionProcessing(true));

    client.service('authManagement').create({
      action: 'resetPwdLong',
      value: { token, password }
    })
      .then(() => dispatch(didResetPassword(true)))
      .catch(() => dispatch(didResetPassword(false)))
      .finally(() => dispatch(actionProcessing(false)));
  }
}