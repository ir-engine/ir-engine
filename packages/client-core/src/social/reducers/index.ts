import { chatReducer } from './chat/ChatState'
import { friendReducer } from './friend/FriendState'
import { locationReducer } from './location/LocationState'
import { groupReducer } from './group/GroupState'
import { partyReducer } from './party/PartyState'
import { inviteReducer } from './invite/InviteState'
import { inviteTypeReducer } from './inviteType/InviteTypeState'

export default {
  locations: locationReducer,
  chat: chatReducer,
  friends: friendReducer,
  party: partyReducer,
  groups: groupReducer,
  invite: inviteReducer,
  invitesTypeData: inviteTypeReducer
}
