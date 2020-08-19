// Initializes the `accept-invite` service on path `/accept-invite`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { AcceptInvite } from './accept-invite.class'
import hooks from './accept-invite.hooks'
import config from '../../config'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'a-i': AcceptInvite & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/a-i', new AcceptInvite(options, app), redirect)

  // Get our initialized service so that we can register hooks
  const service = app.service('a-i')

  service.hooks(hooks)
}

function redirect (req, res, next): Promise<any> {
  if (res.data.error) {
    return res.redirect(`${(config.client.url)}/?error=${(res.data.error as string)}`)
  }
  return res.redirect(`${(config.client.url)}/auth/magiclink?type=login&token=${(res.data.token as string)}`)
}
