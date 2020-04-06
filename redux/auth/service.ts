import { apiServer } from "../../config/server";
import { Dispatch } from "redux";
import { 
  EmailLoginForm, 
  EmailRegistrationForm, 
  loginProcessing, 
  logoutProcessing, 
  registerProcessing, 
  didLogout,
  loginUserByEmailSuccess,
  AuthUser,
  loginUserByEmailError,
  registerUserByEmailSuccess,
  registerUserByEmailError
} from "./actions";
// import { ajaxPost } from "../service.common";
import { client } from "../feathers";

// const using_auth = false;

export function loginUserByEmail(form: EmailLoginForm) {
  return (dispatch: Dispatch) => {
    dispatch(loginProcessing(true));

    client.authenticate({
      strategy: 'local',
      email: form.email,
      password: form.password
    })
    .then(res => dispatch(loginUserByEmailSuccess(res as AuthUser)))
    .catch(() => dispatch(loginUserByEmailError()))
    .finally( ()=> dispatch(loginProcessing(false)));
  };
}

export function loginUserByGithub() {
  return (dispatch: Dispatch) => {
    dispatch(loginProcessing(true));

    window.location.href = `${apiServer}/oauth/github`;
  };
}

export function logoutUser() {
  return (dispatch: Dispatch) => {
    dispatch(logoutProcessing(true));
    client.logout()
      .then(() => dispatch(didLogout()))
      .catch(() => dispatch(didLogout()))
      .finally(() => dispatch(logoutProcessing(false)));
  }
}

export function registerUserByEmail(form: EmailRegistrationForm) {
  return (dispatch: Dispatch) => {
    dispatch(registerProcessing(true));

    client.service('users').create(form)
      .then((user: any) => dispatch(registerUserByEmailSuccess(user)))
      .catch(() => dispatch(registerUserByEmailError()))
      .finally(() => dispatch(registerProcessing(false)));
  }
}
