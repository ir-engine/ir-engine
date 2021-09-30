import { chatReducer } from './chat/ChatState'
import { friendReducer } from './friend/FriendState'
import locationReducer from './location/reducers'
import groupReducer from './group/reducers'
import partyReducer from './party/reducers'
import inviteReducer from './invite/reducers'
import inviteTypeReducer from './inviteType/reducers'

export default {
  locations: locationReducer,
  chat: chatReducer,
  friends: friendReducer,
  party: partyReducer,
  groups: groupReducer,
  invite: inviteReducer,
  invitesTypeData: inviteTypeReducer
}
