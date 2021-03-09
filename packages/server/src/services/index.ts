import { Application } from '../declarations';

// Types
import ChannelType from './channel-type/channel-type.service';
import ComponentType from './component-type/component-type.service';
import CollectionType from './collection-type/collection-type.service';
import GroupUserRank from './group-user-rank/group-user-rank.service';
import InviteType from './invite-type/invite-type.service';
import LocationType from './location-type/location-type.service';
import StaticResourceType from './static-resource-type/static-resource-type.service';
import SubscriptionLevel from './subscription-level/subscription-level.service';
import SeatStatus from './seat-status/seat-status.service';
import UserRelationshipType from './user-relationship-type/user-relationship-type.service';
import UserRole from './user-role/user-role.service';
import SubscriptionType from './subscription-type/subscription-type.service';

// Objects
import Attribution from './attribution/attribution.service';
import Collection from './collection/collection.service';
import Component from './component/component.service';
import Entity from './entity/entity.service';
import Group from './group/group.service';
import IdentityProvider from './identity-provider/identity-provider.service';
import Instance from './instance/instance.service';
import Invite from './invite/invite.service';
import License from './license/license.service';
import GameserverSubdomainProvision from './gameserver-subdomain-provision/gameserver-subdomain-provision.service';
import LoginToken from './login-token/login-token.service';
import Location from './location/location.service';
import LocationSettings from './location-settings/location-settings.service';
import LocationBan from './location-ban/location-ban.service';
import Party from './party/party.service';
import Project from './project/project.service';
import RtcPorts from './rtc-ports/rtc-ports.service';
import Seat from './seat/seat.service';
import StaticResource from './static-resource/static-resource.service';
import User from './user/user.service';
import UserRelationship from './user-relationship/user-relationship.service';
import UserSettings from './user-settings/user-settings.service';

// Junctions
import GroupUser from './group-user/group-user.service';
import PartyUser from './party-user/party-user.service';
import LocationAdmin from './location-admin/location-admin.service';

// Services
import AcceptInvite from './accept-invite/accept-invite.service';
import Auth from './auth-management/auth-management.service';
import Channel from './channel/channel.service';
import Email from './email/email.service';
import InstanceProvision from './instance-provision/instance-provision.service';
import Login from './login/login.service';
import MagicLink from './magic-link/magic-link.service';
import Message from './message/message.service';
import MessageStatus from './message-status/message-status.service';
import SMS from './sms/sms.service';
import Tag from './tag/tag.service';
import Upload from './upload/upload.service';
import Video from './video/video.service';
import Subscription from './subscription/subscription.service';
import SubscriptionConfirm from './subscription-confirm/subscription-confirm.service';
import Feed from './feed/feed.service';
import FeedFires from './feed-fires/feed-fires.service';
import FeedBookmark from './feed-bookmark/feed-bookmark.service';
import Comments from './comments/comments.service';
import CommentsFires from './comments-fires/comments-fires.service';

// Editor
import MediaSearch from './media-search/media-search.service';
import Meta from './meta/meta.service';
import PublishProject from './publish-project/publish-project.service';
import UploadMedia from './upload-media/upload-media.service';
import ResolveMedia from './resolve-media/resolve-media.service';

// GraphQL
import GraphQL from './graphql/graphql.service';


export default (app: Application): void => {
  // Dynamic types
  app.configure(ChannelType);
  app.configure(CollectionType);
  app.configure(ComponentType);
  app.configure(GroupUserRank);
  app.configure(InviteType);
  app.configure(LocationType);
  app.configure(SeatStatus);
  app.configure(StaticResourceType);
  app.configure(SubscriptionLevel);
  app.configure(SubscriptionType);
  app.configure(UserRelationshipType);

  // Objects
  app.configure(Attribution);
  app.configure(Collection);
  app.configure(Component);
  app.configure(Entity);
  app.configure(Group);
  app.configure(IdentityProvider);
  app.configure(Instance);
  app.configure(Invite);
  app.configure(License);
  app.configure(GameserverSubdomainProvision);
  app.configure(Location);
  app.configure(LocationSettings);
  app.configure(LocationBan);
  app.configure(LoginToken);
  app.configure(Party);
  app.configure(Project);
  app.configure(RtcPorts);
  app.configure(Seat);
  app.configure(StaticResource);
  app.configure(Subscription);
  app.configure(User);
  app.configure(UserRelationship);
  app.configure(UserRole);
  app.configure(UserSettings);

  // Junctions
  app.configure(PartyUser);
  app.configure(GroupUser);
  app.configure(LocationAdmin);

  // Services
  app.configure(AcceptInvite);
  app.configure(Auth);
  app.configure(Channel);
  app.configure(Email);
  app.configure(InstanceProvision);
  app.configure(Login);
  app.configure(MagicLink);
  app.configure(Message);
  app.configure(MessageStatus);
  app.configure(SMS);
  app.configure(Tag);
  app.configure(SubscriptionConfirm);
  app.configure(Upload);
  // app.configure(Video);
  app.configure(Feed); // ARC
  app.configure(FeedFires); // ARC
  app.configure(FeedBookmark); // ARC
  app.configure(Comments); // ARC
  app.configure(CommentsFires); // ARC

  // Editor
  app.configure(MediaSearch);
  app.configure(Meta);
  app.configure(UploadMedia);
  app.configure(PublishProject);
  app.configure(ResolveMedia);

  // GraphQL
  app.configure(GraphQL);
};
