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

import { HookContext } from '@feathersjs/feathers/lib/declarations'
import { identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import appConfig from '@ir-engine/server-core/src/appconfig'
import { disallow } from 'feathers-hooks-common'
import { sign } from 'jsonwebtoken'
import { Application } from '../../../declarations'

const getZendeskToken = async (context: HookContext<Application>) => {
  const identityProviders = await context.app
    .service(identityProviderPath)
    .find({ query: { userId: context.params.user.id } })

  const { email } = identityProviders.data.find((ip) => ip.email!)!

  context.result = sign(
    {
      scope: 'user',
      external_id: context.params.user.id,
      name: context.params.user.name,
      email
    },
    appConfig.zendesk.secret!,
    {
      header: {
        alg: 'HS256',
        kid: appConfig.zendesk.kid
      }
    }
  )
  return context
}

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [getZendeskToken],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
