import GroupUserRank from './group-user-rank/group-user-rank.service';
import InviteType from './invite-type/invite-type.service';
import UserRelationshipType from './user-relationship-type/user-relationship-type.service';
import Group from './group/group.service';
import Invite from './invite/invite.service';
import Party from './party/party.service';
import UserRelationship from './user-relationship/user-relationship.service';
import GroupUser from './group-user/group-user.service';
import Message from './message/message.service';
import MessageStatus from './message-status/message-status.service';

export default [
  GroupUserRank,
  InviteType,
  UserRelationshipType,
  Group,
  Invite,
  Party,
  UserRelationship,
  GroupUser,
  Message,
  MessageStatus
]