import { Application } from '../declarations'

// Types
import ComponentType from './component-type/component-type.service'
import CollectionType from './collection-type/collection-type.service'
import EntityType from './entity-type/entity-type.service'
import RelationshipType from './relationship-type/relationship-type.service'
import StaticResourceType from './static-resource-type/static-resource-type.service'
import AccessControlScope from './access-control-scope/access-control-scope.service'

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
import Relationship from './relationship/relationship.service'
import User from './user/user.service'
import Role from './role/role.service'
import AccessControl from './access-control/access-control.service'

// Junctions
import GroupUser from './group-user/group-user.service'

// Services
import Auth from './auth-management/auth-management.service'
import Email from './email/email.service'
import MagicLink from './magiclink/magiclink.service'
import PublicVideo from './public-video/public-video.service'
import SMS from './sms/sms.service'
import Upload from './upload/upload.service'

// Misc
import Scene from './scene/scene.service'


import resourceType from './resource-type/resource-type.service';


export default (app: Application): void => {
  // Types
  app.configure(ComponentType)
  app.configure(CollectionType)
  app.configure(StaticResourceType)
  app.configure(EntityType)
  app.configure(RelationshipType)

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
  app.configure(Relationship)
  app.configure(StaticResource)
  app.configure(User)

  // Junctions
  app.configure(GroupUser)

  // Services
  app.configure(Email)
  app.configure(Auth)
  app.configure(PublicVideo)
  app.configure(MagicLink)
  app.configure(SMS)
  app.configure(Upload)

  // Misc
  app.configure(Scene)
  app.configure(Role)
  app.configure(AccessControl)
  app.configure(AccessControlScope)
  app.configure(resourceType);
}
