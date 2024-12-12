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

// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import { HookContext as FeathersHookContext } from '@feathersjs/feathers'
import type { Application as KoaFeathers } from '@feathersjs/koa'
import { ServiceSwaggerOptions } from 'feathers-swagger'
import Primus from 'primus'

import '@feathersjs/transport-commons'

import { ServiceTypes } from '@ir-engine/common/declarations'
import { NetworkConnectionParams } from '@ir-engine/common/src/interfaces/NetworkInterfaces'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

export type PrimusType = Primus & {
  forEach(cb: (spark: Primus.Spark, id: string, connections: { [id: string]: Primus.Spark }) => boolean | void): Primus
  use(name: string, fn: (req: any, res: any, next: any) => void, level?: number): Primus
}

export type Application = KoaFeathers<ServiceTypes> & {
  sync: any
  primus: PrimusType
  isSetup: Promise<boolean>
}

/**
 * Ref: https://feathersjs-ecosystem.github.io/feathers-swagger/#/?id=configure-the-documentation-for-a-feathers-service
 */
declare module '@feathersjs/feathers' {
  interface ServiceOptions {
    docs?: ServiceSwaggerOptions
  }
  interface RealTimeConnection {
    socketQuery?: NetworkConnectionParams
  }
  interface Params {
    socketQuery?: NetworkConnectionParams
    user?: UserType
    isInternal?: boolean
    forwarded?: {
      ip: string
      port?: number
      secure?: boolean
    }
  }
}

/**
 * Add the user as an optional property to all params
 */
declare module '@feathersjs/knex' {
  interface KnexAdapterParams {
    socketQuery?: NetworkConnectionParams
    user?: UserType
    isInternal?: boolean
    forwarded?: {
      ip: string
      port?: number
      secure?: boolean
    }
  }
}

/**
 * The context for hook functions - can be typed with a service class
 */
export type HookContext<S = any> = FeathersHookContext<Application, S>
