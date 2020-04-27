import { Application } from '../declarations'

// Types
import ComponentType from './component-type/component-type.service'
import CollectionType from './collection-type/collection-type.service'
import EntityType from './entity-type/entity-type.service'
import UserRelationshipType from './user-relationship-type/user-relationship-type.service'
import StaticResourceType from './static-resource-type/static-resource-type.service'
import AccessControlScope from './access-control-scope/access-control-scope.service'
import ResourceType from './resource-type/resource-type.service'
import organizationUserRank from './organization-user-rank/organization-user-rank.service'

// Objects
import Attribution from './attribution/attribution.service'
import Collection from './collection/collection.service'
import Component from './component/component.service'
import Entity from './entity/entity.service'
import Group from './group/group.service'
import Instance from './instance/instance.service'
import license from './license/license.service'
import Location from './location/location.service'
import Organization from './organization/organization.service'
import Project from './project/project.service'
import StaticResource from './static-resource/static-resource.service'
import UserRelationship from './user-relationship/user-relationship.service'
import User from './user/user.service'
import Role from './user-role/user-role.service'
import AccessControl from './access-control/access-control.service'

// Junctions
import GroupUser from './group-user/group-user.service'
import organizationUser from './organization-user/organization-user.service'

// Services
import Auth from './auth-management/auth-management.service'
import Email from './email/email.service'
import MagicLink from './magiclink/magiclink.service'
import SMS from './sms/sms.service'
import Upload from './upload/upload.service'
import Video from './video/video.service'
import GraphQL from './graphql/graphql.service'
import identityProvider from './identity-provider/identity-provider.service'

// Misc
import Scene from './scene/scene.service'

export default (app: Application): void => {
  // Types
  app.configure(ComponentType)
  app.configure(CollectionType)
  app.configure(ResourceType)
  app.configure(StaticResourceType)
  app.configure(EntityType)
  app.configure(UserRelationshipType)

  // Objects
  app.configure(Attribution)
  app.configure(Collection)
  app.configure(Component)
  app.configure(Entity)
  app.configure(Group)
  app.configure(Instance)
  app.configure(Location)
  app.configure(license)
  app.configure(Organization)
  app.configure(Project)
  app.configure(UserRelationship)
  app.configure(StaticResource)
  app.configure(User)

  // Junctions
  app.configure(GroupUser)

  // Services
  app.configure(Email)
  app.configure(Auth)
  app.configure(MagicLink)
  app.configure(SMS)
  app.configure(Upload)
  app.configure(Video)
  app.configure(GraphQL)
  app.configure(identityProvider)

  // Misc
  app.configure(Scene)
  app.configure(Role)
  app.configure(AccessControl)
  app.configure(AccessControlScope)
  app.configure(organizationUserRank)
  app.configure(organizationUser)
}
