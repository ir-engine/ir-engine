import { Dispatch } from 'redux';
import { client } from '../feathers';
import {dispatchAlertSuccess} from '../alert/service';
import {
  sentInvite,
  retrievedReceivedInvites,
  retrievedSentInvites,
  createdReceivedInvite,
  removedReceivedInvite,
  createdSentInvite,
  removedSentInvite,
  acceptedInvite,
  declinedInvite,
  setInviteTarget,
  fetchingReceivedInvites,
  fetchingSentInvites,
} from './actions';
import { Invite } from '@xr3ngine/common/interfaces/Invite';
import {dispatchAlertError} from '../alert/service';
import store from "../store";
import {User} from "@xr3ngine/engine/src/common/interfaces/User";

const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const phoneRegex = /^[0-9]{10}$/;
const userIdRegex = /^[0-9a-f]{32}$/;

export function sendInvite (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    let send = true;

    if (data.identityProviderType === 'email') {
      if (emailRegex.test(data.token) !== true) {
        dispatchAlertError(dispatch, 'Invalid email address');
        send = false;
      }
    }
    if (data.identityProviderType === 'sms') {
      if (phoneRegex.test(data.token) !== true) {
        dispatchAlertError(dispatch, 'Invalid 10-digit US phone number');
        send = false;
      }
    }
    if (data.invitee != null) {
      if (userIdRegex.test(data.invitee) !== true) {
        dispatchAlertError(dispatch, 'Invalid user ID');
        send = false;
      }
    }
    if ((data.token == null || data.token.length === 0) && (data.invitee == null || data.invitee.length === 0)) {
      dispatchAlertError(dispatch, `Not a valid recipient`);
      send = false;
    }

    if (send === true) {
      try {
        const inviteResult = await client.service('invite').create({
          inviteType: data.type,
          token: data.token,
          targetObjectId: data.targetObjectId,
          identityProviderType: data.identityProviderType,
          inviteeId: data.invitee
        });
        dispatchAlertSuccess(dispatch, 'Invite Sent');
        dispatch(sentInvite(inviteResult));
      } catch (err) {
        console.log(err);
        dispatchAlertError(dispatch, err.message);
      }
    }
  };
}

export function retrieveReceivedInvites(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingReceivedInvites());
    try {
      const inviteResult = await client.service('invite').find({
        query: {
          type: 'received',
          $limit: limit != null ? limit : getState().get('invite').get('receivedInvites').get('limit'),
          $skip: skip != null ? skip : getState().get('invite').get('receivedInvites').get('skip')
        }
      });
      dispatch(retrievedReceivedInvites(inviteResult));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function retrieveSentInvites(skip?: number, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(fetchingSentInvites());
    try {
      const inviteResult = await client.service('invite').find({
        query: {
          type: 'sent',
          $limit: limit != null ? limit : getState().get('invite').get('sentInvites').get('limit'),
          $skip: skip != null ? skip : getState().get('invite').get('sentInvites').get('skip')
        }
      });
      dispatch(retrievedSentInvites(inviteResult));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removeInvite(invite: Invite) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(invite.id);
      dispatch(removedSentInvite());
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);}
  };
}

export function acceptInvite(inviteId: string, passcode: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('a-i').get(inviteId, {
        query: {
          passcode: passcode
        }
      });
      dispatch(acceptedInvite());
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);}
  };
}

export function declineInvite(invite: Invite) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('invite').remove(invite.id);
      dispatch(declinedInvite());
    } catch(err) {
      dispatchAlertError(dispatch, err.message);}
  };
}

export function updateInviteTarget(targetObjectType?: string, targetObjectId?: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(setInviteTarget(targetObjectType, targetObjectId));
  };
}

client.service('invite').on('created', (params) => {
  const invite = params.invite;
  const selfUser = (store.getState() as any).get('auth').get('user') as User;
  if (invite.userId === selfUser.id) {
    store.dispatch(createdSentInvite());
  } else {
    store.dispatch(createdReceivedInvite());
  }
});

client.service('invite').on('removed', (params) => {
  const invite = params.invite;
  const selfUser = (store.getState() as any).get('auth').get('user') as User;
  if (invite.userId === selfUser.id) {
    store.dispatch(removedSentInvite());
  } else {
    store.dispatch(removedReceivedInvite());
  }
});