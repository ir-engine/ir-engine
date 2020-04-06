import { apiServer } from "../../config/server";
import { Dispatch } from "redux";
import { 
  EmailLoginForm, 
  EmailRegistrationForm, 
  loginProcessing, 
  loginUserByEmailSuccess, 
  loginUserByEmailError, 
  logoutProcessing, 
  registerProcessing, 
  registerUserByEmailSuccess, 
  registerUserByEmailError 
} from "./actions";
import { ajaxPost } from "../service.common";

const using_auth = false;

export function loginUserByEmail(form: EmailLoginForm) {
  return (dispatch: Dispatch) => {
    dispatch(loginProcessing(true));

    ajaxPost(`${apiServer}/authentication`, 
      { strategy: 'local', ...form }, 
      using_auth)
      .then(res => dispatch(loginUserByEmailSuccess(res)))
      .catch(() => dispatch(loginUserByEmailError()))
      .finally(() => dispatch(loginProcessing(false)));
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

    ajaxPost( `${apiServer}/authentication/logout`, {}, using_auth )
      .then(res => dispatch(loginUserByEmailSuccess(res)))
      .catch(() => dispatch(loginUserByEmailError()))
      .finally(() => dispatch(logoutProcessing(false)));
  }
}

export function registerUserByEmail(form: EmailRegistrationForm) {
  return (dispatch: Dispatch) => {
    dispatch(registerProcessing(true));

    ajaxPost( `${apiServer}/users`, form, using_auth )
      .then(res => dispatch(registerUserByEmailSuccess(res)))
      .catch(() => dispatch(registerUserByEmailError()))
      .finally(() => dispatch(registerProcessing(false)));
  }
}
