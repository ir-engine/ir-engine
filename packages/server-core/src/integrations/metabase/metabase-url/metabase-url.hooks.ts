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

import { NotImplemented } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { metabaseUrlDataValidator } from '@ir-engine/common/src/schemas/integrations/metabase/metabase-url.schema'
import { HookContext } from '@ir-engine/server-core/declarations'
import verifyScope from '@ir-engine/server-core/src/hooks/verify-scope'
import { disallow, iff } from 'feathers-hooks-common'
import Jwt from 'jsonwebtoken'
import isAction from '../../../hooks/is-action'
import { MetabaseUrlService } from './metabase-url.class'

/**
 * Get iframe URL of Metabase dashboard for crash
 * @param context
 */
export const metabaseCrashDashboard = async (context: HookContext<MetabaseUrlService>) => {
  const metabaseSetting = await context.app.service(engineSettingPath).find({
    query: {
      category: 'metabase'
    }
  })

  if (metabaseSetting.data.length === 0) {
    throw new NotImplemented('Please enter metabase settings')
  }

  const METABASE_SITE_URL = metabaseSetting.data.find((setting) => setting.key == EngineSettings.Metabase.SiteUrl)
    ?.value
  const METABASE_SECRET_KEY = metabaseSetting.data.find((setting) => setting.key == EngineSettings.Metabase.SecretKey)
    ?.value
  const METABASE_ENVIRONMENT = metabaseSetting.data.find(
    (setting) => setting.key == EngineSettings.Metabase.Environment
  )?.value
  const METABASE_EXPIRATION = Number(
    metabaseSetting.data.find((setting) => setting.key == EngineSettings.Metabase.Expiration)?.value
  )
  const METABASE_CRASH_DASHBOARD_ID = metabaseSetting.data.find(
    (setting) => setting.key == EngineSettings.Metabase.CrashDashboardId
  )?.value

  if (!METABASE_CRASH_DASHBOARD_ID) {
    throw new NotImplemented('Please enter crash dashboard id in metabase settings')
  }

  const payload = {
    resource: { dashboard: parseInt(METABASE_CRASH_DASHBOARD_ID) },
    params: {
      environment: [METABASE_ENVIRONMENT]
    },
    exp: Math.round(Date.now() / 1000) + METABASE_EXPIRATION * 60
  }

  const token = Jwt.sign(payload, METABASE_SECRET_KEY!)
  context.dispatch = METABASE_SITE_URL + '/embed/dashboard/' + token + '#theme=transparent&bordered=false&titled=true'
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
