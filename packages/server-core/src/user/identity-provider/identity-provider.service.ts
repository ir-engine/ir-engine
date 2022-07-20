import { Paginated } from '@feathersjs/feathers'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'

import { Application } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import { IdentityProvider } from './identity-provider.class'
import identyDocs from './identity-provider.docs'
import hooks from './identity-provider.hooks'
import createModel from './identity-provider.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'identity-provider': IdentityProvider
    'generate-token': any
  }
}

/**
 * Initialize our service with any options it requires and docs
 */
export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new IdentityProvider(options, app)
  event.docs = identyDocs

  app.use('identity-provider', event)

  const service = app.service('identity-provider')

  app.use('generate-token', {
    create: async ({ type, token }, params): Promise<string | null> => {
      const userId = params.user.id
      if (!token || !type) throw new Error('Must pass service and identity-provider token to generate JWT')
      const ipResult = (await app.service('identity-provider').find({
        query: {
          userId: userId,
          type: type,
          token: token
        }
      })) as Paginated<IdentityProviderInterface>
      if (ipResult.total > 0) {
        const ip = ipResult.data[0]
        return app.service('authentication').createAccessToken({}, { subject: ip.id.toString() })
      } else return null
    }
  })

  app.service('generate-token').hooks({
    before: {
      create: [authenticate()]
    }
  })

  service.hooks(hooks)
}
