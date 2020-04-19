import Uploads from './upload/upload.service'
import Email from './email/email.service'
import Auth from './auth-management/auth-management.service'
import User from './user/user.service'
import Group from './group/group.service'
import Contact from './contact/contact.service'
import publicVideo from './public-video/public-video.service'
import Avatar from './avatar/avatar.service'
import Objects from './object/object.service'
import Scene from './scene/scene.service'
import Location from './location/location.service'
import Instance from './instance/instance.service'

import { Application } from '../declarations'

import magiclink from './magiclink/magiclink.service'
import groupMember from './group-member/group-member.service'
import sms from './sms/sms.service'

import attribution from './attribution/attribution.service'

import image from './image/image.service'

import component from './component/component.service'

import componentType from './component-type/component-type.service'

import entity from './entity/entity.service'

import resourceType from './resource-type/resource-type.service'

import collectionType from './collection-type/collection-type.service'

import license from './license/license.service'

import resource from './resource/resource.service'

import componentResource from './component-resource/component-resource.service'

import collection from './collection/collection.service'

import collectionEntity from './collection-entity/collection-entity.service'

export default (app: Application): void => {
  app.configure(Uploads)
  app.configure(Email)
  app.configure(Auth)
  app.configure(User)
  app.configure(Group)
  app.configure(Contact)
  app.configure(Avatar)
  app.configure(Objects)
  app.configure(Scene)
  app.configure(Location)
  app.configure(Instance)
  app.configure(publicVideo)
  app.configure(magiclink)
  app.configure(groupMember)
  app.configure(sms)
  app.configure(attribution)
  app.configure(image)
  app.configure(component)
  app.configure(componentType)
  app.configure(entity)
  app.configure(resourceType)
  app.configure(collectionType)
  app.configure(license)
  app.configure(resource)
  app.configure(componentResource)
  app.configure(collection)
  app.configure(collectionEntity)
}
