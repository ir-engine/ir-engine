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

import { HookContext } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  moderationAttachmentDataValidator,
  moderationAttachmentPatchValidator,
  moderationAttachmentQueryValidator
} from '@ir-engine/common/src/schemas/moderation/moderation-attachment.schema'
import config from '@ir-engine/server-core/src/appconfig'
import verifyScope from '@ir-engine/server-core/src/hooks/verify-scope'
import { iff, isProvider } from 'feathers-hooks-common'
import {
  moderationAttachmentDataResolver,
  moderationAttachmentExternalResolver,
  moderationAttachmentPatchResolver,
  moderationAttachmentQueryResolver,
  moderationAttachmentResolver
} from './moderation-attachment.resolvers'

export const appendBaseUrl = () => {
  return async (context: HookContext) => {
    if (context.result) {
      if (Array.isArray(context.result.data)) {
        const baseUrl = config.aws.s3.endpoint
        const bucketName = config.aws.s3.staticResourceBucket
        context.result = context.result.data.map((item) => ({
          ...item,
          filePath: `${baseUrl}/${bucketName}${item.filePath}`
        }))
      }
    }
    return context
  }
}
export default {
  around: {
    all: [
      schemaHooks.resolveExternal(moderationAttachmentExternalResolver),
      schemaHooks.resolveResult(moderationAttachmentResolver)
    ]
  },
  before: {
    all: [
      schemaHooks.validateQuery(moderationAttachmentQueryValidator),
      schemaHooks.resolveQuery(moderationAttachmentQueryResolver)
    ],
    find: [
      iff(isProvider('external'), verifyScope('moderation', 'read')),
      schemaHooks.validateQuery(moderationAttachmentQueryValidator),
      schemaHooks.resolveQuery(moderationAttachmentQueryResolver)
    ],
    get: [
      iff(isProvider('external'), verifyScope('moderation', 'read')),
      schemaHooks.validateQuery(moderationAttachmentQueryValidator),
      schemaHooks.resolveQuery(moderationAttachmentQueryResolver)
    ],
    create: [
      schemaHooks.validateData(moderationAttachmentDataValidator),
      schemaHooks.resolveData(moderationAttachmentDataResolver)
    ],
    patch: [
      iff(isProvider('external'), verifyScope('moderation', 'write')),
      schemaHooks.validateData(moderationAttachmentPatchValidator),
      schemaHooks.resolveData(moderationAttachmentPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('moderation', 'write'))]
  },
  after: {
    all: [],
    find: [appendBaseUrl()],
    get: [appendBaseUrl()],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: []
  }
} as any
