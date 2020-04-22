import { Application } from '../declarations'

import Email from './email/email.service'
import Auth from './auth-management/auth-management.service'
import User from './user/user.service'
import publicVideo from './public-video/public-video.service'
import Scene from './scene/scene.service'
import Location from './location/location.service'
import Instance from './instance/instance.service'
import magiclink from './magiclink/magiclink.service'
import Group from './group/group.service'
import groupMember from './group-member/group-member.service'
import sms from './sms/sms.service'
import attribution from './attribution/attribution.service'
import image from './image/image.service'
import component from './component/component.service'
import componentType from './component-type/component-type.service'
import entity from './entity/entity.service'
import collectionType from './collection-type/collection-type.service'
import license from './license/license.service'
import resource from './resource/resource.service'
import collection from './collection/collection.service'
import project from './project/project.service'
import video from './video/video.service'
import collectionEntity from './collection-entity/collection-entity.service'
import entityComponent from './entity-component/entity-component.service'
import componentResource from './component-resource/component-resource.service'
import userResource from './user-resource/user-resource.service'
import userEntity from './user-entity/user-entity.service'
import upload from './upload/upload.service'
import relationship from './relationship/relationship.service'
import relationshipType from './relationship-type/relationship-type.service'
import resourceChild from './resource-child/resource-child.service'
import resourceType from './resource-type/resource-type.service'

export default (app: Application): void => {
  app.configure(Email)
  app.configure(Auth)
  app.configure(User)
  app.configure(Group)
  app.configure(groupMember)
  app.configure(Scene)
  app.configure(Location)
  app.configure(Instance)
  app.configure(publicVideo)
  app.configure(magiclink)
  app.configure(sms)
  app.configure(attribution)
  app.configure(image)
  app.configure(componentType)
  app.configure(component)
  app.configure(entity)
  app.configure(collectionType)
  app.configure(license)
  app.configure(resource)
  app.configure(collection)
  app.configure(project)
  app.configure(video)
  app.configure(collectionEntity)
  app.configure(entityComponent)
  app.configure(componentResource)
  app.configure(userResource)
  app.configure(userEntity)
  app.configure(relationship)
  app.configure(relationshipType)
  app.configure(resourceChild)
  app.configure(resourceType)
  app.configure(upload)
}
