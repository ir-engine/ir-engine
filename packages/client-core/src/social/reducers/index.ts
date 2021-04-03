import chatReducer from './chat/reducers';
import friendReducer from './friend/reducers';
import groupReducer from './group/reducers';
import inviteReducer from './invite/reducers';
import inviteTypeReducer from "./inviteType/reducers";

export default {
  chat: chatReducer,
  friends: friendReducer,
  groups: groupReducer,
  invite: inviteReducer,
  invitesTypeData: inviteTypeReducer
};
