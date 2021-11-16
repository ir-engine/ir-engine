import { Profile } from './profile.class'
import createModel from './profile.model'
import hooks from './profile.hooks'
import { Profile as ProfileInterface } from '@xrengine/common/src/interfaces/MatchProfile'
import profileDocs from './profile.docs'
import { Application } from '@xrengine/server-core/declarations'

// Add this service to the service type index
declare module '@xrengine/server-core/declarations' {
  interface ServiceTypes {
    profile: ProfileInterface
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  const profile = new Profile(options, app)
  profile.docs = profileDocs
  // @ts-ignore
  app.use('profile', profile)

  // Get our initialized service so that we can register hooks
  const service = app.service('profile')

  service.hooks(hooks)
}
