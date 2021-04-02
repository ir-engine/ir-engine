import { resolveUser } from '@xr3ngine/common/interfaces/User';
import { endVideoChat, leave } from '@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions';
import { client } from '@xr3ngine/client-core/redux/feathers';
import store from "@xr3ngine/client-core/redux/store";
import { userUpdated } from '@xr3ngine/client-core/redux/auth/actions';

client.service('location-ban').on('created', async (params) => {
  const state = store.getState() as any;
  const selfUser = state.get('auth').get('user');
  const party = state.get('party');
  const selfPartyUser = party && party.partyUsers ? party.partyUsers.find((partyUser) => partyUser.userId === selfUser.id) : {};
  const currentLocation = state.get('locations').get('currentLocation').get('location');
  const locationBan = params.locationBan;
  if (selfUser.id === locationBan.userId && currentLocation.id === locationBan.locationId) {
    endVideoChat({ leftParty: true });
    leave(true);
    if (selfPartyUser.id != null) {
      await client.service('party-user').remove(selfPartyUser.id);
    }
    const user = resolveUser(await client.service('user').get(selfUser.id));
    store.dispatch(userUpdated(user));
  }
});
