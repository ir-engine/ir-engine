import { Application } from '../declarations'
import users from './users/users.service'
import scenes from './scenes/scenes.service'
import groups from './groups/groups.service'
import contacts from './contacts/contacts.service'
import xrAvatars from './xr-avatars/xr-avatars.service'
import xrLocations from './xr-locations/xr-locations.service'
import xrObjects from './xr-objects/xr-objects.service'

import xrLocationInstances from './xr-location-instances/xr-location-instances.service'

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users)
  app.configure(scenes)
  app.configure(groups)
  app.configure(contacts)
  app.configure(xrAvatars)
  app.configure(xrLocations)
  app.configure(xrObjects)
  app.configure(xrLocationInstances)
}
