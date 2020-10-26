import { Dispatch } from 'redux';
import { v1 } from 'uuid';
import {
  EmailLoginForm,
  EmailRegistrationForm,
  didLogout,
  loginUserSuccess,
  loginUserError,
  registerUserByEmailSuccess,
  registerUserByEmailError,
  didVerifyEmail,
  actionProcessing,
  didResendVerificationEmail,
  didForgotPassword,
  didResetPassword,
  didCreateMagicLink,
  updateSettings,
  loadedUserData,
  avatarUpdated,
  usernameUpdated,
  userUpdated
} from './actions';
import {
  addedLayerUser,
  clearLayerUsers,
  removedLayerUser
} from '../user/actions';
import { client } from '../feathers';
import { dispatchAlertError, dispatchAlertSuccess } from '../alert/service';
import { validateEmail, validatePhoneNumber } from '../helper';
import { axiosRequest, apiUrl } from '../service.common';

import { IdentityProvider } from '@xr3ngine/common/interfaces/IdentityProvider';
import getConfig from 'next/config';
import { getStoredState } from '../persisted.store';
import axios from 'axios';
import { resolveAuthUser } from '@xr3ngine/common/interfaces/AuthUser';
import { resolveUser } from '@xr3ngine/common/interfaces/User';
import store from "../store";
import { Network } from '@xr3ngine/engine/src/networking/components/Network';

const { publicRuntimeConfig } = getConfig();
const apiServer: string = publicRuntimeConfig.apiServer;
const authConfig = publicRuntimeConfig.auth;

export function doLoginAuto (allowGuest?: boolean) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const authData = getStoredState('auth');
      let accessToken = authData && authData.authUser ? authData.authUser.accessToken : undefined;

      // console.log(allowGuest);
      // console.log(accessToken);
      if (allowGuest !== true && !accessToken) {
        return;
      }

      if (allowGuest === true && !accessToken) {
        console.log('Logging in as guest');
        const newProvider = await client.service('identity-provider').create({
          type: 'guest',
          token: v1()
        });
        accessToken = newProvider.accessToken;
      }

      await (client as any).authentication.setAccessToken(accessToken as string);
      const res = await (client as any).reAuthenticate();
      if (res) {
        const authUser = resolveAuthUser(res);
        dispatch(loginUserSuccess(authUser));
        loadUserData(dispatch, authUser.identityProvider.userId);
      } else {
        console.log('****************');
      }
    } catch (err) {
      console.log(err);
      dispatch(didLogout());

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  };
}

export function loadUserData (dispatch: Dispatch, userId: string): any {
  client.service('user').get(userId)
    .then((res: any) => {
      const user = resolveUser(res);
      dispatch(loadedUserData(user));
    })
    .catch((err: any) => {
      console.log(err);
      dispatchAlertError(dispatch, 'Failed to load user data');
    });
}

export function loginUserByPassword (form: EmailLoginForm) {
  return (dispatch: Dispatch): any => {
    // check email validation.
    if (!validateEmail(form.email)) {
      dispatchAlertError(dispatch, 'Please input valid email address');

      return;
    }

    dispatch(actionProcessing(true));

    (client as any).authenticate({
      strategy: 'local',
      email: form.email,
      password: form.password
    })
      .then((res: any) => {
        const authUser = resolveAuthUser(res);

        if (!authUser.identityProvider.isVerified) {
          (client as any).logout();

          dispatch(registerUserByEmailSuccess(authUser.identityProvider));
          window.location.href = '/auth/confirm';
          return;
        }

        dispatch(loginUserSuccess(authUser));
        loadUserData(dispatch, authUser.identityProvider.userId);
        window.location.href = '/';
      })
      .catch((err: any) => {
        console.log(err);

        dispatch(loginUserError('Failed to login'));
        dispatchAlertError(dispatch, err.message);
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function loginUserByGithub () {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));
    window.location.href = `${apiServer}/oauth/github`;
  };
}

export function loginUserByGoogle () {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));
    window.location.href = `${apiServer}/oauth/google`;
  };
}

export function loginUserByFacebook () {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));
    window.location.href = `${apiServer}/oauth/facebook`;
  };
}

export function loginUserByJwt (accessToken: string, redirectSuccess: string, redirectError: string, subscriptionId?: string): any {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(actionProcessing(true));
      const res = await (client as any).authenticate({
        strategy: 'jwt',
        accessToken
      });

      const authUser = resolveAuthUser(res);

      if (subscriptionId != null && subscriptionId.length > 0) {
        await client.service('seat').patch(authUser.identityProvider.userId, {
          subscriptionId: subscriptionId
        });
        dispatch(loginUserSuccess(authUser));
        loadUserData(dispatch, authUser.identityProvider.userId);
      } else {
        console.log('JWT login succeeded');
        console.log(authUser);
        dispatch(loginUserSuccess(authUser));
        loadUserData(dispatch, authUser.identityProvider.userId);
      }
      dispatch(actionProcessing(false));
      window.location.href = redirectSuccess;
    } catch(err) {
      console.log(err);
      dispatch(loginUserError('Failed to login'));
      dispatchAlertError(dispatch, err.message);
      window.location.href = `${redirectError}?error=${err.message}`;
      dispatch(actionProcessing(false));
    }
  };
}

export function logoutUser () {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));
    (client as any).logout()
      .then(() => dispatch(didLogout()))
      .catch(() => dispatch(didLogout()))
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function registerUserByEmail (form: EmailRegistrationForm) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('identity-provider').create({
      token: form.email,
      password: form.password,
      type: 'password'
    })
      .then((identityProvider: any) => {
        dispatch(registerUserByEmailSuccess(identityProvider));
        window.location.href = '/auth/confirm';
      })
      .catch((err: any) => {
        console.log(err);
        dispatch(registerUserByEmailError(err.message));
        dispatchAlertError(dispatch, err.message);
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function verifyEmail (token: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('authManagement').create({
      action: 'verifySignupLong',
      value: token
    })
      .then((res: any) => {
        dispatch(didVerifyEmail(true));
        loginUserByJwt(res.accessToken, '/', '/')(dispatch);
      })
      .catch((err: any) => {
        console.log(err);
        dispatch(didVerifyEmail(false));
        dispatchAlertError(dispatch, err.message);
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function resendVerificationEmail (email: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('authManagement').create({
      action: 'resendVerifySignup',
      value: {
        token: email,
        type: 'password'
      }
    })
      .then(() => dispatch(didResendVerificationEmail(true)))
      .catch(() => dispatch(didResendVerificationEmail(false)))
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function forgotPassword (email: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('authManagement').create({
      action: 'sendResetPwd',
      value: {
        token: email,
        type: 'password'
      }
    })
      .then(() => dispatch(didForgotPassword(true)))
      .catch(() => dispatch(didForgotPassword(false)))
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function resetPassword (token: string, password: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('authManagement').create({
      action: 'resetPwdLong',
      value: { token, password }
    })
      .then((res: any) => {
        console.log(res);
        dispatch(didResetPassword(true));
        window.location.href = '/';
      })
      .catch((err: any) => {
        console.log(err);
        dispatch(didResetPassword(false));
        window.location.href = '/';
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function createMagicLink (emailPhone: string, linkType?: 'email' | 'sms') {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    let type = 'email';
    let paramName = 'email';
    const enableEmailMagicLink = (authConfig && authConfig.enableEmailMagicLink) ?? true;
    const enableSmsMagicLink = (authConfig && authConfig.enableSmsMagicLink) ?? false;

    if (linkType === 'email') {
      type = 'email';
      paramName = 'email';
    } else if (linkType === 'sms') {
      type = 'sms';
      paramName = 'mobile';
    } else {
      const stripped = emailPhone.replace(/-/g, '');
      if (validatePhoneNumber(stripped)) {
        if (!enableSmsMagicLink) {
          dispatchAlertError(dispatch, 'Please input valid email address');

          return;
        }
        type = 'sms';
        paramName = 'mobile';
        emailPhone = '+1' + stripped;
      } else if (validateEmail(emailPhone)) {
        if (!enableEmailMagicLink) {
          dispatchAlertError(dispatch, 'Please input valid phone number');

          return;
        }
        type = 'email';
      } else {
        dispatchAlertError(dispatch, 'Please input valid email or phone number');

        return;
      }
    }

    client.service('magic-link').create({
      type,
      [paramName]: emailPhone
    })
      .then((res: any) => {
        console.log(res);
        dispatch(didCreateMagicLink(true));
        dispatchAlertSuccess(dispatch, 'Login Magic Link was sent. Please check your Email or SMS.');
      })
      .catch((err: any) => {
        console.log(err);
        dispatch(didCreateMagicLink(false));
        dispatchAlertError(dispatch, err.message);
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function addConnectionByPassword (form: EmailLoginForm, userId: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('identity-provider').create({
      token: form.email,
      password: form.password,
      type: 'password',
      userId
    })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider;
        loadUserData(dispatch, identityProvider.userId);
      })
      .catch((err: any) => {
        console.log(err);
        dispatchAlertError(dispatch, err.message);
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function addConnectionByEmail (email: string, userId: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('magic-link').create({
      email,
      type: 'email',
      userId
    })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider;
        loadUserData(dispatch, identityProvider.userId);
      })
      .catch((err: any) => {
        console.log(err);
        dispatchAlertError(dispatch, err.message);
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function addConnectionBySms (phone: string, userId: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('magic-link').create({
      mobile: phone,
      type: 'sms',
      userId
    })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider;
        loadUserData(dispatch, identityProvider.userId);
      })
      .catch((err: any) => {
        console.log(err);
        dispatchAlertError(dispatch, err.message);
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function addConnectionByOauth (oauth: 'facebook' | 'google' | 'github', userId: string) {
  return (/* dispatch: Dispatch */) => {
    window.open(`${apiServer}/auth/oauth/${oauth}?userId=${userId}`, '_blank');
  };
}

export function removeConnection (identityProviderId: number, userId: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true));

    client.service('identity-provider').remove(identityProviderId)
      .then(() => {
        loadUserData(dispatch, userId);
      })
      .catch((err: any) => {
        console.log(err);
        dispatchAlertError(dispatch, err.message);
      })
      .finally(() => dispatch(actionProcessing(false)));
  };
}

export function refreshConnections (userId: string) { (dispatch: Dispatch): any => loadUserData(dispatch, userId); }

export const updateUserSettings = (id: any, data: any) => async (dispatch: any) => {
  const res = await axiosRequest('PATCH', `${apiUrl}/user-settings/${id}`, data);
  dispatch(updateSettings(res.data));
};

export function uploadAvatar (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    const token = getState().get('auth').get('authUser').accessToken;
    const selfUser = getState().get('auth').get('user');
    const res = await axios.post(`${apiUrl}/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token
      }
    });
    await client.service('user').patch(selfUser.id, {
      name: selfUser.name
    });
    const result = res.data;
    dispatchAlertSuccess(dispatch, 'Avatar updated');
    dispatch(avatarUpdated(result));
  };
}

export function updateUsername (userId: string, name: string) {
  return (dispatch: Dispatch): any => {
    client.service('user').patch(userId, {
      name: name
    })
      .then((res: any) => {
        dispatchAlertSuccess(dispatch, 'Username updated');
        dispatch(usernameUpdated(res));
      });
  };
}

client.service('user').on('patched', async (params) => {
  const selfUser = (store.getState() as any).get('auth').get('user');
  const user = resolveUser(params.userRelationship);
  console.log('User Patched: ' + user.id);
  if (selfUser.id === user.id) {
    if (selfUser.instanceId !== user.instanceId) {
      store.dispatch(clearLayerUsers());
    }
    store.dispatch(userUpdated(user));
    if (user.partyId) {
      (Network.instance.transport as any).setPartyId(user.partyId);
    }
  } else {
    console.log('Not self user');
    console.log(user);
    if (user.instanceId === selfUser.instanceId) {
      store.dispatch(addedLayerUser(user));
    } else {
      store.dispatch(removedLayerUser(user));
    }
  }
});

client.service('location-ban').on('created', async(params) => {
  console.log('Location Ban created');
  const state = store.getState() as any;
  const selfUser = state.get('auth').get('user');
  const party = state.get('party');
  const selfPartyUser = party && party.partyUsers ? party.partyUsers.find((partyUser) => partyUser.userId === selfUser.id) : {};
  const currentLocation = state.get('locations').get('currentLocation').get('location');
  const locationBan = params.locationBan;
  console.log('Current location id: ' + currentLocation.id);
  console.log(locationBan);
  if (selfUser.id === locationBan.userId && currentLocation.id === locationBan.locationId) {
    await (Network.instance.transport as any).endVideoChat(true);
    await (Network.instance.transport as any).leave();
    if (selfPartyUser.id != null) {
      await client.service('party-user').remove(selfPartyUser.id);
    }
    const user = resolveUser(await client.service('user').get(selfUser.id));
    console.log('Fetched user');
    console.log(user);
    store.dispatch(userUpdated(user));
  }
});