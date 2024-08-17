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

import { metabaseSettingPath } from '@etherealengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import { metabaseUrlDataValidator } from '@etherealengine/common/src/schemas/integrations/metabase/metabase-url.schema'
import { HookContext } from '@etherealengine/server-core/declarations'
import verifyScope from '@etherealengine/server-core/src/hooks/verify-scope'
import { NotImplemented } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff } from 'feathers-hooks-common'
import Jwt from 'jsonwebtoken'
import isAction from '../../../hooks/is-action'
import { MetabaseUrlService } from './metabase-url.class'

/**
 * Get iframe URL of Metabase dashboard for crash
 * @param context
 */
export const metabaseCrashDashboard = async (context: HookContext<MetabaseUrlService>) => {
  const metabaseSetting = await context.app.service(metabaseSettingPath).find()

  if (metabaseSetting.data.length === 0) {
    throw new NotImplemented('Please enter metabase settings')
  }

  const METABASE_SITE_URL = metabaseSetting.data[0].siteUrl
  const METABASE_SECRET_KEY = metabaseSetting.data[0].secretKey
  const ENVIRONMENT = metabaseSetting.data[0].environment
  const EXPIRATION = metabaseSetting.data[0].expiration
  const METABASE_CRASH_DASHBOARD_ID = metabaseSetting.data[0].crashDashboardId

  if (!METABASE_CRASH_DASHBOARD_ID) {
    throw new NotImplemented('Please enter crash dashboard id in metabase settings')
  }

  const payload = {
    resource: { dashboard: parseInt(METABASE_CRASH_DASHBOARD_ID) },
    params: {
      environment: [ENVIRONMENT]
    },
    exp: Math.round(Date.now() / 1000) + EXPIRATION * 60
  }

  const token = Jwt.sign(payload, METABASE_SECRET_KEY)
  context.dispatch = METABASE_SITE_URL + '/embed/dashboard/' + token + '#theme=transparent&bordered=false&titled=false'
}

export default {
  around: {
    all: []
  },

  before: {
    all: [],
    get: [disallow('external')],
    find: [disallow('external')],
    create: [
      schemaHooks.validateData(metabaseUrlDataValidator),
      iff(isAction('crash'), verifyScope('admin', 'admin'), metabaseCrashDashboard)
    ],
    patch: [disallow('external')],
    update: [disallow('external')],
    remove: [disallow('external')]
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
