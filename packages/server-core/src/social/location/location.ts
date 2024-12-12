/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { locationMethods, locationPath } from '@ir-engine/common/src/schemas/social/location.schema'

import { Application, HookContext } from '../../../declarations'
import config from '../../appconfig'
import { LocationService } from './location.class'
import locationDocs from './location.docs'
import hooks from './location.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [locationPath]: LocationService
  }
}

export default (app: Application): void => {
  const options = {
    name: locationPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(locationPath, new LocationService(options), {
    // A list of all methods this service exposes externally
    methods: locationMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: locationDocs
  })

  const service = app.service(locationPath)
  service.hooks(hooks)

  config.authentication.whiteList.push({
    path: locationPath,
    methods: {
      find: async (context: HookContext) => {
        // ensure that we are only allowing unauthenticated requests for a very specific query
        if (
          context.params.query?.action === 'viewer' &&
          context.params.query?.slugifiedName &&
          context.params.query?.slugifiedName !== '' &&
          Object.keys(context.params.query).length === 2
        ) {
          delete context.params.query.action
          return true
        }

        // force authentication for all other situations
        return false
      }
    }
  })
}
