import { Application } from '../declarations'
import users from './users/users.service'
import locations from './locations/locations.service'
import scenes from './scenes/scenes.service'
import groups from './groups/groups.service'
import contacts from './contacts/contacts.service'
import instances from './instances/instances.service'
import xrAvatars from './xr-avatars/xr-avatars.service'
import xrObjects from './xr-objects/xr-objects.service'

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users)
  app.configure(locations)
  app.configure(scenes)
  app.configure(groups)
  app.configure(contacts)
  app.configure(instances)
  app.configure(xrAvatars)
  app.configure(xrObjects)
}
