import { Application } from '../declarations'
import users from './users/users.service'
import groups from './groups/groups.service'
import contacts from './contacts/contacts.service'
import xrAvatars from './xr-avatars/xr-avatars.service'
import xrLocations from './xr-locations/xr-locations.service'
import xrObjects from './xr-objects/xr-objects.service'
import xrObjectsScenes from './xr-objects-scenes/xr-objects-scenes.service'

import xrLocationInstances from './xr-location-instances/xr-location-instances.service'

import xrScenes from './xr-scenes/xr-scenes.service'

import uploads from './uploads/uploads.service';
import email from './email/email.service'
import authManagement from './auth-management/auth-management.service'

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users)
  app.configure(groups)
  app.configure(contacts)
  app.configure(email)
  app.configure(authManagement)
  app.configure(xrAvatars)
  app.configure(xrLocations)
  app.configure(xrObjects)
  app.configure(xrLocationInstances)
  app.configure(xrObjectsScenes)
  app.configure(xrScenes)
  app.configure(uploads);
}
