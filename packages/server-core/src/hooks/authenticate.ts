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

import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'

import config from '../appconfig'
import { Application } from './../../declarations'

const { authenticate } = authentication.hooks

export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { params } = context

    if (!context.params) context.params = {}
    const authHeader = params.headers?.authorization
    let authSplit
    if (authHeader) authSplit = authHeader.split(' ')
    let token, user
    if (authSplit) token = authSplit[1]
    if (token) {
      const key = await context.app.service('user-api-key').Model.findOne({
        where: {
          token: token
        }
      })
      if (key != null)
        user = await context.app.service('user').Model.findOne({
          include: [
            {
              model: context.app.service('scope').Model
            }
          ],
          where: {
            id: key.userId
          }
        })
    }
    if (user) {
      context.params.user = user
      return context
    }
    context = await authenticate('jwt')(context as any)
    // if (!context.params[config.authentication.entity]?.userId) throw new BadRequest('Must authenticate with valid JWT or login token')
    context.params.user =
      context.params[config.authentication.entity] && context.params[config.authentication.entity].userId
        ? await context.app.service('user').Model.findOne({
            include: [
              {
                model: context.app.service('scope').Model
              }
            ],
            where: {
              id: context.params[config.authentication.entity].userId
            }
          })
        : {}
    return context
  }
}
