/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
