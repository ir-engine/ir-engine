import { Application } from '../declarations'

// Types
import AccessControlScope from './access-control-scope/access-control-scope.service'
import ComponentType from './component-type/component-type.service'
import CollectionType from './collection-type/collection-type.service'
import EntityType from './entity-type/entity-type.service'
import GroupUserRank from './group-user-rank/group-user-rank.service'
import IdentityProviderType from './identity-provider-type/identity-provider-type.service'
import ResourceType from './resource-type/resource-type.service'
import StaticResourceType from './static-resource-type/static-resource-type.service'
import UserRelationshipType from './user-relationship-type/user-relationship-type.service'
import UserRole from './user-role/user-role.service'

// Objects
import AccessControl from './access-control/access-control.service'
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
import StaticResource from './static-resource/static-resource.service'
import User from './user/user.service'
import UserRelationship from './user-relationship/user-relationship.service'
import UserSettings from './user-settings/user-settings.service'

// Junctions
import GroupUser from './group-user/group-user.service'
import PartyUser from './party-user/party-user.service'

// Services
import Auth from './auth-management/auth-management.service'
import Email from './email/email.service'
import MagicLink from './magiclink/magiclink.service'
import SMS from './sms/sms.service'
import Upload from './upload/upload.service'
import Video from './video/video.service'
import GraphQL from './graphql/graphql.service'

// Spoke
import Asset from './asset/asset.service'
import MediaSearch from './media-search/media-search.service'
import OwnedFile from './owned-file/owned-file.service'
import ProjectAsset from './project-asset/project-asset.service'
import PublishProject from './publish-project/publish-project.service'
import Scene from './scene/scene.service'
import SceneListing from './scene-listing/scene-listing.service'
import UploadMedia from './upload-media/upload-media.service'

import Messages from './messages/messages.service'

import Conversation from './conversation/conversation.service'

import ChatRoom from './chatroom/chatroom.service'

import MessageStatus from './message-status/message-status.service'

import subscription from './subscription/subscription.service'

export default (app: Application): void => {
  // Dynamic Enums
  app.configure(ComponentType)
  app.configure(CollectionType)
  app.configure(ResourceType)
  app.configure(StaticResourceType)
  app.configure(EntityType)
  app.configure(UserRelationshipType)
  app.configure(IdentityProviderType)
  app.configure(AccessControlScope)
  app.configure(GroupUserRank)

  // Objects
  app.configure(AccessControl)
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
  app.configure(StaticResource)
  app.configure(User)
  app.configure(UserRelationship)
  app.configure(UserRole)
  app.configure(UserSettings)
  app.configure(subscription)
  // Junctions
  app.configure(PartyUser)
  app.configure(GroupUser)

  // Services
  app.configure(Email)
  app.configure(Auth)
  app.configure(MagicLink)
  app.configure(SMS)
  app.configure(Upload)
  app.configure(Video)
  app.configure(IdentityProvider)

  // Spoke
  app.configure(Asset)
  app.configure(OwnedFile)
  app.configure(ProjectAsset)
  app.configure(Scene)
  app.configure(SceneListing)
  app.configure(MediaSearch)
  app.configure(UploadMedia)
  app.configure(PublishProject)
  app.configure(GraphQL)
  app.configure(Messages)
  app.configure(Conversation)
  app.configure(ChatRoom)
  app.configure(MessageStatus)
}
