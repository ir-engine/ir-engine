import { Application } from '../declarations'

// Types
import componentType from './component-type/component-type.service'
import collectionType from './collection-type/collection-type.service'
import entityType from './entity-type/entity-type.service'
import relationshipType from './relationship-type/relationship-type.service'
import resourceType from './resource-type/resource-type.service'

// Objects
import attribution from './attribution/attribution.service'
import collection from './collection/collection.service'
import component from './component/component.service'
import entity from './entity/entity.service'
import Group from './group/group.service'
import Instance from './instance/instance.service'
import license from './license/license.service'
import Location from './location/location.service'
import organization from './organization/organization.service'
import project from './project/project.service'
import resource from './resource/resource.service'
import relationship from './relationship/relationship.service'
import User from './user/user.service'

// Junctions
import collectionEntity from './collection-entity/collection-entity.service'
import componentResource from './component-resource/component-resource.service'
import entityComponent from './entity-component/entity-component.service'
import groupUser from './group-user/group-user.service'
import organizationUser from './organization-user/organization-user.service'
import resourceChild from './resource-child/resource-child.service'
import userResource from './user-resource/user-resource.service'
import userEntity from './user-entity/user-entity.service'

// Services
import Auth from './auth-management/auth-management.service'
import Email from './email/email.service'
import magiclink from './magiclink/magiclink.service'
import publicVideo from './public-video/public-video.service'
import sms from './sms/sms.service'
import upload from './upload/upload.service'

// Misc
import Scene from './scene/scene.service'

import userCollection from './user-collection/user-collection.service'

import locationCollection from './location-collection/location-collection.service'

export default (app: Application): void => {
  // Types
  app.configure(componentType)
  app.configure(collectionType)
  app.configure(resourceType)
  app.configure(entityType)
  app.configure(relationshipType)

  // Objects
  app.configure(attribution)
  app.configure(collection)
  app.configure(component)
  app.configure(entity)
  app.configure(Group)
  app.configure(Instance)
  app.configure(Location)
  app.configure(license)
  app.configure(organization)
  app.configure(project)
  app.configure(relationship)
  app.configure(resource)
  app.configure(User)

  // Junctions
  app.configure(groupUser)
  app.configure(collectionEntity)
  app.configure(entityComponent)
  app.configure(componentResource)
  app.configure(userResource)
  app.configure(userEntity)
  app.configure(resourceChild)
  app.configure(organizationUser)

  // Services
  app.configure(Email)
  app.configure(Auth)
  app.configure(publicVideo)
  app.configure(magiclink)
  app.configure(sms)
  app.configure(upload)

  // Misc
  app.configure(Scene)
  app.configure(userCollection)
  app.configure(locationCollection)
}
