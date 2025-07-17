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

import { disallow, isProvider } from 'feathers-hooks-common'
import { SYNC } from 'feathers-sync'

import { BadRequest, MethodNotAllowed } from '@feathersjs/errors'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { UploadFile } from '@ir-engine/common/src/interfaces/UploadAssetInterface'
import { featureFlagSettingPath } from '@ir-engine/common/src/schema.type.module'
import logRequest from '@ir-engine/server-core/src/hooks/log-request'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import { Application, HookContext } from '../../../declarations'

const validateFiles = (context: HookContext) => {
  const args = context.arguments
  const files = args?.[1]?.files as UploadFile[]
  if (!files) throw new BadRequest('No files provided')
  files.forEach((file: UploadFile) => {
    if (!file.originalname.includes('.')) throw new BadRequest('File name must include a file extension')
    if (
      !(
        file.originalname.endsWith('.tsx') ||
        file.originalname.endsWith('.ts') ||
        file.originalname.endsWith('.jsx') ||
        file.originalname.endsWith('.js')
      )
    ) {
      throw new BadRequest(
        'Unsupported file type:' +
          file.originalname.split('.').pop() +
          '. Only TypeScript (.tsx, .ts) and JavaScript (.jsx, .js) files are allowed.'
      )
    }
  })
}

/**
 * Check if the scripting feature flag is enabled
 * Disables the service if the flag is disabled
 */
const checkScriptingEnabled = async (context: HookContext) => {
  if (!isProvider('external')(context)) {
    return context
  }

  const app = context.app as Application
  const result = await app.service(featureFlagSettingPath).find({
    query: {
      flagName: FeatureFlags.Studio.Panel.Script
    }
  })

  const data = result.data || result
  if (Array.isArray(data) && data.length > 0 && !data[0].flagValue) {
    throw new MethodNotAllowed('Scripting is disabled')
  }

  return context
}

export default {
  before: {
    all: [logRequest()],
    find: [disallow()],
    get: [],
    create: [checkScriptingEnabled, setLoggedInUser('userId'), validateFiles],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context: HookContext) => {
        ;(context as any)[SYNC] = false
        return context
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
