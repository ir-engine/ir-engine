import Uploads from './upload/upload.service'
import Email from './email/email.service'
import Auth from './auth-management/auth-management.service'
import User from './user/user.service'
import Group from './group/group.service'
import Contact from './contact/contact.service'
import SceneObject from './scene-object/scene-object.service'
import publicVideo from './public-video/public-video.service'
import Avatar from './avatar/avatar.service'
import Objects from './object/object.service'
import Scene from './scene/scene.service'
import Location from './location/location.service'
import Instance from './instance/instance.service'

import { Application } from '../declarations'

import magiclink from './magiclink/magiclink.service'

import groupMember from './group-member/group-member.service';


export default (app: Application): void => {
  app.configure(Uploads)
  app.configure(Email)
  app.configure(Auth)
  app.configure(User)
  app.configure(Group)
  app.configure(Contact)
  app.configure(SceneObject)
  app.configure(Avatar)
  app.configure(Objects)
  app.configure(Scene)
  app.configure(Location)
  app.configure(Instance)
  app.configure(publicVideo)
  app.configure(magiclink)
  app.configure(groupMember)
}
