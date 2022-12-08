import { Application, defaultEventMap, defaultServiceMethods, TransportConnection } from '@feathersjs/feathers'
import { Service, SocketService } from '@feathersjs/transport-commons/client'

export type { SocketService }

declare module '@feathersjs/feathers/lib/declarations' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface FeathersApplication<Services, Settings> {
    /**
     * The Primus client instance. Usually does not need
     * to be accessed directly.
     */
    primus?: any
  }
}

export default function primusClient<Services = any>(connection: any, options?: any) {
  if (!connection) {
    throw new Error('Primus connection needs to be provided')
  }

  const defaultService = function (this: any, name: string) {
    const events = Object.values(defaultEventMap)
    const settings = Object.assign({}, options, {
      name,
      connection,
      method: 'send'
    })
    return new Service(settings) as any
  }

  const initialize = function (app: Application<Services>) {
    if (app.primus !== undefined) {
      throw new Error('Only one default client provider can be configured')
    }

    app.primus = connection as any
    app.defaultService = defaultService
    app.mixins.unshift((service, _location, options) => {
      if (options && options.methods && service instanceof Service) {
        const customMethods = options.methods.filter((name) => !defaultServiceMethods.includes(name))

        service.methods(...customMethods)
      }
    })
  }

  initialize.Service = Service
  initialize.service = defaultService

  return initialize as TransportConnection<Services>
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(primusClient, module.exports)
}
