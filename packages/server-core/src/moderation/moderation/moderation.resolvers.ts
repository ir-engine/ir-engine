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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  ModerationID,
  ModerationQuery,
  ModerationType
} from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

const resolveUserEmail = async (userId: UserID | undefined, context: HookContext) => {
  if (!userId) return undefined

  const identityProvider = await context.app.service(identityProviderPath)._find({
    query: {
      userId: userId,
      $limit: 1
    }
  })
  return identityProvider?.data[0]?.email || undefined
}

export const moderationResolver = resolve<ModerationType, HookContext>({
  createdAt: virtual(async (moderation) => fromDateTimeSql(moderation.createdAt)),
  updatedAt: virtual(async (moderation) => fromDateTimeSql(moderation.updatedAt))
})

export const moderationExternalResolver = resolve<ModerationType, HookContext>({
  reportedUserEmail: virtual(async (moderation: ModerationType, context: HookContext) => {
    if (context.method === 'find') return resolveUserEmail(moderation.reportedUserId, context)
  }),
  createdByEmail: virtual(async (moderation: ModerationType, context: HookContext) => {
    if (context.method === 'find') return resolveUserEmail(moderation.createdBy, context)
  })
})
export const moderationDataResolver = resolve<ModerationType, HookContext>({
  id: async () => {
    return uuidv4() as ModerationID
  },
  reportedAt: getDateTimeSql,
  ipAddress: async (_, __, context) => {
    return context.params.forwarded?.ip || '::1'
  },
  createdBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const moderationPatchResolver = resolve<ModerationType, HookContext>({
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id
  },
  updatedAt: getDateTimeSql
})

export const moderationQueryResolver = resolve<ModerationQuery, HookContext>({})
