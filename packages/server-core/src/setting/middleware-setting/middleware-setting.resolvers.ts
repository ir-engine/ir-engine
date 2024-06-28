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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 as uuidv4 } from 'uuid'

import {
  MiddlewareApiDatabaseType,
  MiddlewareApiType,
  MiddlewareSettingApiQuery,
  MiddlewareSettingDatabaseType,
  MiddlewareSettingQuery,
  MiddlewareSettingType
} from '@etherealengine/common/src/schemas/setting/middleware-setting.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { fromDateTimeSql, getDateTimeSql } from '../../../../common/src/utils/datetime-sql'

export const middlewareDbToSchema = (rawData: MiddlewareSettingDatabaseType): MiddlewareSettingType => {
  return {
    ...rawData
  }
}

// Middleware API
export const middlewareApiDbToSchema = (rawData: MiddlewareApiDatabaseType): MiddlewareApiType => {
  return {
    ...rawData
  }
}

export const middlewareSettingResolver = resolve<MiddlewareSettingType, HookContext>(
  {
    createdAt: virtual(async (middlewareSetting) => fromDateTimeSql(middlewareSetting.createdAt)),
    updatedAt: virtual(async (middlewareSetting) => fromDateTimeSql(middlewareSetting.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return middlewareDbToSchema(rawData)
    }
  }
)

// Middleware API
export const middlewareApiResolver = resolve<MiddlewareApiType, HookContext>(
  {
    createdAt: virtual(async (middlewareApi) => fromDateTimeSql(middlewareApi.createdAt)),
    updatedAt: virtual(async (middlewareApi) => fromDateTimeSql(middlewareApi.updatedAt))
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return middlewareApiDbToSchema(rawData)
    }
  }
)

export const middlewareSettingExternalResolver = resolve<MiddlewareSettingType, HookContext>({})

// Middleware API
export const middlewareApiExternalResolver = resolve<MiddlewareApiType, HookContext>({})

export const middlewareSettingDataResolver = resolve<MiddlewareSettingDatabaseType, HookContext>(
  {
    id: async () => {
      return uuidv4()
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData
      }
    }
  }
)

// Middleware API
export const middlewareApiDataResolver = resolve<MiddlewareApiType, HookContext>(
  {
    id: async () => {
      return uuidv4()
    },
    createdAt: getDateTimeSql,
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData
      }
    }
  }
)

export const middlewareSettingPatchResolver = resolve<MiddlewareSettingType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData
      }
    }
  }
)

// Middleware API
export const middlewareApiPatchResolver = resolve<MiddlewareApiType, HookContext>(
  {
    updatedAt: getDateTimeSql
  },
  {
    // Convert the raw data into a new structure before running property resolvers
    converter: async (rawData, context) => {
      return {
        ...rawData
      }
    }
  }
)

export const middlewareSettingQueryResolver = resolve<MiddlewareSettingQuery, HookContext>({})

// Middleware API
export const middlewareApiQueryResolver = resolve<MiddlewareSettingApiQuery, HookContext>({})
