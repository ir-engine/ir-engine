import { Dispatch } from 'redux';
import { client } from '../feathers';
import {
  loadedParty,
  createdParty,
  patchedParty,
  removedParty,
  removedPartyUser,
  createdPartyUser,
  patchedPartyUser
} from './actions';
import { dispatchAlertError } from '../alert/service';
import store from './../store';
import { Network } from '@xr3ngine/engine/src/networking/components/Network';
import { provisionInstanceServer } from '../instanceConnection/service';

// import { Party } from '@xr3ngine/common/interfaces/Party'

export function getParty () {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      // console.log('CALLING GETPARTY()');
      const partyResult = await client.service('party').get(null);
      dispatch(loadedParty(partyResult));
    } catch (err) {
      dispatchAlertError(dispatch, err.message);
    }
  };
}

// Temporary Method for arbitrary testing

let socketId: any;
export const getParties = async (): Promise<void> => {
  const parties = await client.service('party').find();
  console.log('PARTIES', parties);
  const userId = (store.getState() as any).get('auth').get('user').id;
  console.log('USERID: ', userId);
  if ((client as any).io && socketId === undefined) {
    (client as any).io.emit('request-socket-id', ({ id }: { id: number }) => {
      console.log('Socket-ID received: ', id);
      socketId = id;
    });
    (client as any).io.on('message-party', (data: any) => {
      console.warn('Message received, data: ', data);
    })
    ;(window as any).joinParty = (userId: number, partyId: number) => {
      (client as any).io.emit('join-party', {
        userId,
        partyId
      }, (res) => {
        console.log('Join response: ', res);
      });
    }
    ;(window as any).messageParty = (userId: number, partyId: number, message: string) => {
      (client as any).io.emit('message-party-request', {
        userId,
        partyId,
        message
      });
    }
    ;(window as any).partyInit = (userId: number) => {
      (client as any).io.emit('party-init', { userId }, (response: any) => {
        response ? console.log('Init success', response) : console.log('Init failed');
      });
    };
  } else {
    console.log('Your socket id is: ', socketId);
  }
};

export function createParty(values: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    console.log('CREATING PARTY');
    try {
      await client.service('party').create({});
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removeParty(partyId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    console.log('CALLING FEATHERS REMOVE PARTY');
    try {
      const channelResult = await client.service('channel').find({
        query: {
          partyId: partyId
        }
      });
      if (channelResult.total > 0) {
        await client.service('channel').remove(channelResult.data[0].id);
      }
      await client.service('party').remove(partyId);
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removePartyUser(partyUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('party-user').remove(partyUserId);
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function transferPartyOwner(partyUserId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('party-user').patch(partyUserId, {
        isOwner: 1
      });
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

client.service('party-user').on('created', async (params) => {
  const selfUser = (store.getState() as any).get('auth').get('user');
  if ((store.getState() as any).get('party').get('party') == null) {
    store.dispatch(createdParty(params));
  }
  store.dispatch(createdPartyUser(params.partyUser));
  if (params.partyUser.userId === selfUser.id) {
    const party = await client.service('party').get(params.partyUser.partyId);
    const dbUser = await client.service('user').get(selfUser.id);
    if (party.instanceId != null && party.instanceId !== dbUser.instanceId && (store.getState() as any).get('instanceConnection').get('instanceProvisioning') === false) {
      const instance = await client.service('instance').get(party.instanceId);
      const updateUser = dbUser;
      updateUser.partyId = party.id;
      store.dispatch(patchedPartyUser(updateUser));
      await provisionInstanceServer(instance.locationId, instance.id)(store.dispatch, store.getState);
    }
  }
});

client.service('party-user').on('patched', (params) => {
  store.dispatch(patchedPartyUser(params.partyUser));
});

client.service('party-user').on('removed', (params) => {
  const selfUser = (store.getState() as any).get('auth').get('user');
  store.dispatch(removedPartyUser(params.partyUser));
  if (params.partyUser.userId === selfUser.id) {
    console.log('Attempting to end video call');
    (Network.instance?.transport as any)?.endVideoChat(true);
    // (Network.instance?.transport as any)?.leave();
  }
});

client.service('party').on('created', (params) => {
  store.dispatch(createdParty(params.party));
});

client.service('party').on('patched', (params) => {
  store.dispatch(patchedParty(params.party));
});

client.service('party').on('removed', (params) => {
  store.dispatch(removedParty(params.party));
});
