import { Application } from '../declarations'

// Types
import ComponentType from './component-type/component-type.service'
import CollectionType from './collection-type/collection-type.service'
import ConversationType from './conversation-type/conversation-type.service'
import EntityType from './entity-type/entity-type.service'
import GroupUserRank from './group-user-rank/group-user-rank.service'
import IdentityProviderType from './identity-provider-type/identity-provider-type.service'
import StaticResourceType from './static-resource-type/static-resource-type.service'
import SubscriptionLevel from './subscription-level/subscription-level.service'
import SeatStatus from './seat-status/seat-status.service'
import UserRelationshipType from './user-relationship-type/user-relationship-type.service'
import UserRole from './user-role/user-role.service'
import SubscriptionType from './subscription-type/subscription-type.service'

// Objects
import Attribution from './attribution/attribution.service'
import Collection from './collection/collection.service'
import Component from './component/component.service'
import Entity from './entity/entity.service'
import Group from './group/group.service'
import Instance from './instance/instance.service'
import IdentityProvider from './identity-provider/identity-provider.service'
import License from './license/license.service'
import Location from './location/location.service'
import Party from './party/party.service'
import Project from './project/project.service'
import Seat from './seat/seat.service'
import StaticResource from './static-resource/static-resource.service'
import User from './user/user.service'
import UserRelationship from './user-relationship/user-relationship.service'
import UserSettings from './user-settings/user-settings.service'

// Junctions
import GroupUser from './group-user/group-user.service'
import PartyUser from './party-user/party-user.service'

// Services
import Auth from './auth-management/auth-management.service'
import ChatRoom from './chatroom/chatroom.service'
import Conversation from './conversation/conversation.service'
import Email from './email/email.service'
import MagicLink from './magiclink/magiclink.service'
import Message from './message/message.service'
import SMS from './sms/sms.service'
import Upload from './upload/upload.service'
import Video from './video/video.service'
import GraphQL from './graphql/graphql.service'
import SubscriptionConfirm from './subscription-confirm/subscription-confirm.service'

// Spoke
import Asset from './asset/asset.service'
import MediaSearch from './media-search/media-search.service'
import Meta from './meta/meta.service'
import OwnedFile from './owned-file/owned-file.service'
import ProjectAsset from './project-asset/project-asset.service'
import PublishProject from './publish-project/publish-project.service'
import Scene from './scene/scene.service'
import SceneListing from './scene-listing/scene-listing.service'
import UploadMedia from './upload-media/upload-media.service'
import Subscription from './subscription/subscription.service'

export default (app: Application): void => {
  // Dynamic types
  app.configure(ComponentType)
  app.configure(CollectionType)
  app.configure(ConversationType)
  app.configure(StaticResourceType)
  app.configure(EntityType)
  app.configure(UserRelationshipType)
  app.configure(IdentityProviderType)
  app.configure(SeatStatus)
  app.configure(SubscriptionType)
  app.configure(GroupUserRank)
  app.configure(SubscriptionLevel)

  // Objects
  app.configure(Attribution)
  app.configure(Collection)
  app.configure(Component)
  app.configure(Entity)
  app.configure(Group)
  app.configure(Instance)
  app.configure(Location)
  app.configure(License)
  app.configure(Party)
  app.configure(Project)
  app.configure(Seat)
  app.configure(StaticResource)
  app.configure(Subscription)
  app.configure(User)
  app.configure(UserRelationship)
  app.configure(UserRole)
  app.configure(UserSettings)

  // Junctions
  app.configure(PartyUser)
  app.configure(GroupUser)

  // Services
  app.configure(Auth)
  app.configure(Conversation)
  app.configure(ChatRoom)
  app.configure(Email)
  app.configure(IdentityProvider)
  app.configure(MagicLink)
  app.configure(Message)
  app.configure(SMS)
  app.configure(SubscriptionConfirm)
  app.configure(Upload)
  app.configure(Video)

  // Spoke
  app.configure(Asset)
  app.configure(OwnedFile)
  app.configure(ProjectAsset)
  app.configure(Scene)
  app.configure(SceneListing)
  app.configure(MediaSearch)
  app.configure(Meta)
  app.configure(UploadMedia)
  app.configure(PublishProject)

  app.configure(GraphQL)
}
