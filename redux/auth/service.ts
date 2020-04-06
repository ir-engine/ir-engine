import { apiServer } from "../../config/server";
import { Dispatch } from "redux";
import { loginProcessing, EmailLoginForm, loginUserByEmailSuccess, loginUserByEmailError, logoutProcessing, EmailRegistrationForm, registerProcessing } from "./actions";
import { ajaxPost } from "../service.common";

const using_auth = false;

export function loginUserByEmail(form: EmailLoginForm) {
  return (dispatch: Dispatch) => {
    dispatch(loginProcessing(true));

    ajaxPost( `${apiServer}/authentication/jwt`, form, using_auth )
      .then(res => dispatch(loginUserByEmailSuccess(res)))
      .catch(() => dispatch(loginUserByEmailError()))
      .finally(() => dispatch(loginProcessing(false)));
  };
}

export function loginUserByGithub() {
  return (dispatch: Dispatch) => {
    dispatch(loginProcessing(true));

    ajaxPost( `${apiServer}/authentication/github`, {}, using_auth )
      .then(res => dispatch(loginUserByEmailSuccess(res)))
      .catch(() => dispatch(loginUserByEmailError()))
      .finally(() => dispatch(loginProcessing(false)));
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

    ajaxPost( `${apiServer}/authentication/local`, form, using_auth )
      .then(res => dispatch(loginUserByEmailSuccess(res)))
      .catch(() => dispatch(loginUserByEmailError()))
      .finally(() => dispatch(registerProcessing(false)));
  }
}