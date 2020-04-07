import { Application } from '../declarations'
import users from './users/users.service'
import locations from './locations/locations.service'
import scenes from './scenes/scenes.service'
import objects from './objects/objects.service'
import avatars from './avatars/avatars.service'
import groups from './groups/groups.service'
import contacts from './contacts/contacts.service'
import instances from './instances/instances.service'

// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users)
  app.configure(locations)
  app.configure(scenes)
  app.configure(objects)
  app.configure(avatars)
  app.configure(groups)
  app.configure(contacts)
  app.configure(instances)
}
