import { chatReducer } from './chat/ChatState'
import { friendReducer } from './friend/FriendState'
import { locationReducer } from './location/LocationState'
import { groupReducer } from './group/GroupState'
import { partyReducer } from './party/PartyState'
import { inviteReducer } from './invite/InviteState'
import { inviteTypeReducer } from './inviteType/InviteTypeState'
import { arMediaReducer } from './arMedia/ArMediaState'
import { creatorReducer } from './creator/CreatorState'
import { feedReducer } from './feed/FeedState'
import { feedCommentsReducer } from './feedComment/FeedCommentState'
import { feedFiresReducer } from './feedFires/FeedFiresState'
import { popupsStateReducer } from './popupsState/PopupsStateState'
import { theFeedsReducer } from './thefeeds/TheFeedsState'
import { theFeedsFiresReducer } from './thefeedsFires/TheFeedsFiresState'
import { webxrnativeReducer } from './webxr_native/WebxrNativeState'
import { registrationReducer } from './registration/RegistrationState'

export default {
  locations: locationReducer,
  chat: chatReducer,
  friends: friendReducer,
  party: partyReducer,
  groups: groupReducer,
  invite: inviteReducer,
  invitesTypeData: inviteTypeReducer,
  creators: creatorReducer,
  feeds: feedReducer,
  feedFires: feedFiresReducer,
  feedComments: feedCommentsReducer,
  arMedia: arMediaReducer,
  popups: popupsStateReducer,
  thefeeds: theFeedsReducer,
  thefeedsFires: theFeedsFiresReducer,
  webxrnative: webxrnativeReducer,
  registrationReducer: registrationReducer
}
