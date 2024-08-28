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
import crypto from 'crypto'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'

import { LoginTokenQuery, LoginTokenType } from '@ir-engine/common/src/schemas/user/login-token.schema'
import { fromDateTimeSql, getDateTimeSql, toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { HookContext } from '@ir-engine/server-core/declarations'

import config from '../../appconfig'

export const loginTokenResolver = resolve<LoginTokenType, HookContext>({
  expiresAt: virtual(async (loginToken) => fromDateTimeSql(loginToken.expiresAt)),
  createdAt: virtual(async (loginToken) => fromDateTimeSql(loginToken.createdAt)),
  updatedAt: virtual(async (loginToken) => fromDateTimeSql(loginToken.updatedAt))
})

export const loginTokenExternalResolver = resolve<LoginTokenType, HookContext>({})

export const loginTokenDataResolver = resolve<LoginTokenType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  token: async () => {
    return crypto.randomBytes(config.authentication.bearerToken.numBytes).toString('hex')
  },
  expiresAt: async (value, message, context) => {
    return context.data.expiresAt ? context.data.expiresAt : toDateTimeSql(moment().utc().add(2, 'days').toDate())
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const loginTokenPatchResolver = resolve<LoginTokenType, HookContext>({
  updatedAt: getDateTimeSql
})

export const loginTokenQueryResolver = resolve<LoginTokenQuery, HookContext>({})
