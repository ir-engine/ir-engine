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

import { MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'

import { IdentityProviderInterface } from '@etherealengine/common/src/dbmodels/IdentityProvider'

import authenticate from '../../hooks/authenticate'
import accountService from '../auth-management/auth-management.notifier'

const isPasswordAccountType = () => {
  return (context: HookContext): boolean => {
    if (context.data.type === 'password') {
      return true
    }
    return false
  }
}

const sendVerifyEmail = () => {
  return (context: any): Promise<HookContext> => {
    accountService(context.app).notifier('resendVerifySignup', context.result)
    return context
  }
}

const checkIdentityProvider = (): any => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.id) {
      // If trying to CRUD a specific identity-provider, throw 404 if the user doesn't own it
      const thisIdentityProvider = await (context.app.service('identity-provider') as any).Model.findByPk(context.id)
      if (
        context.params['identity-provider'] &&
        context.params['identity-provider'].userId !== thisIdentityProvider.userId
      )
        throw new NotFound()
    } else {
      // If trying to CRUD multiple identity-providers, e.g. patch all IP's belonging to a user, make params.query.userId
      // the ID of the calling user, so no one can alter anyone else's IPs.
      const userId = context.params['identity-provider']?.userId
      if (!userId) throw new NotFound()
      if (!context.params.query) context.params.query = {}
      context.params.query.userId = userId
    }
    if (context.data) context.data = { password: context.data.password } //If patching externally, should only be able to change password
    return context
  }
}

const checkOnlyIdentityProvider = () => {
  return async (context: HookContext): Promise<HookContext> => {
    if (!context.id) {
      // do not allow to remove identity providers in bulk
      throw new MethodNotAllowed('Cannot remove multiple providers together')
    }

    const thisIdentityProvider = (await (context.app.service('identity-provider') as any).Model.findByPk(
      context.id
    )) as IdentityProviderInterface

    // we only want to disallow removing the last identity provider if it is not a guest
    // since the guest user will be destroyed once they log in
    if (thisIdentityProvider.type === 'guest') return context

    const providers = await context.app
      .service('identity-provider')
      .find({ query: { userId: thisIdentityProvider.userId } })

    if (providers.total <= 1) {
      throw new MethodNotAllowed('Cannot remove the only provider')
    }
    return context
  }
}

export default {
  before: {
    all: [],
    find: [iff(isProvider('external'), authenticate() as any)],
    get: [iff(isProvider('external'), authenticate() as any, checkIdentityProvider())],
    create: [],
    update: [iff(isProvider('external'), authenticate() as any, checkIdentityProvider())],
    patch: [iff(isProvider('external'), authenticate() as any, checkIdentityProvider())],
    remove: [iff(isProvider('external'), authenticate() as any, checkIdentityProvider()), checkOnlyIdentityProvider()]
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
