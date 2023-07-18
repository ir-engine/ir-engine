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

import { HookContext } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import addAssociations from '@etherealengine/server-core/src/hooks/add-associations'

import addScopeToUser from '../../hooks/add-scope-to-user'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'

const restrictUserPatch = (context: HookContext) => {
  if (context.params.isInternal) return context

  // allow admins for all patch actions
  const loggedInUser = context.params.user as UserInterface
  if (
    loggedInUser.scopes &&
    loggedInUser.scopes.find((scope) => scope.type === 'admin:admin') &&
    loggedInUser.scopes.find((scope) => scope.type === 'user:write')
  )
    return context

  // only allow a user to patch it's own data
  if (loggedInUser.id !== context.id)
    throw new Error("Must be an admin with user:write scope to patch another user's data")

  // If a user without admin and user:write scope is patching themself, only allow changes to avatarId and name
  const data = {} as any
  // selective define allowed props as not to accidentally pass an undefined value (which will be interpreted as NULL)
  if (typeof context.data.avatarId !== 'undefined') data.avatarId = context.data.avatarId
  if (typeof context.data.name !== 'undefined') data.name = context.data.name
  context.data = data
  return context
}

const restrictUserRemove = (context: HookContext) => {
  if (context.params.isInternal) return context

  // allow admins for all patch actions
  const loggedInUser = context.params.user as UserInterface
  if (
    loggedInUser.scopes &&
    loggedInUser.scopes.find((scope) => scope.type === 'admin:admin') &&
    loggedInUser.scopes.find((scope) => scope.type === 'user:write')
  )
    return context

  // only allow a user to patch it's own data
  if (loggedInUser.id !== context.id) throw new Error('Must be an admin with user:write scope to delete another user')

  return context
}

const parseAllUserSettings = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { result } = context

    for (const index in result.data) {
      if (result.data[index].user_setting && result.data[index].user_setting.themeModes) {
        let themeModes = JSON.parse(result.data[index].user_setting.themeModes)

        if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

        result.data[index].user_setting.themeModes = themeModes
      }
    }

    return context
  }
}

const parseUserSettings = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { result } = context

    if (result.user_setting && result.user_setting.themeModes) {
      let themeModes = JSON.parse(result.user_setting.themeModes)

      if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

      result.user_setting.themeModes = themeModes
    }

    return context
  }
}

const addAvatarResources = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context

    // if (!result.data) console.log('result.avatar', result, result.avatar, result.avatar?.dataValues, result.dataValues, result.dataValues?.avatar?.dataValues,)

    if (result.dataValues?.avatar) {
      if (result.dataValues?.avatar.modelResourceId)
        try {
          result.dataValues.avatar.modelResource = await app
            .service('static-resource')
            .get(result.dataValues.avatar.modelResourceId)
        } catch (err) {
          logger.error('error getting avatar model %o', err)
        }
      if (result.dataValues?.avatar.dataValues?.modelResourceId)
        try {
          result.dataValues.avatar.dataValues.modelResource = await app
            .service('static-resource')
            .get(result.dataValues.avatar.dataValues.modelResourceId)
        } catch (err) {
          logger.error('error getting avatar model %o', err)
        }
      if (result.dataValues?.avatar.thumbnailResourceId)
        try {
          result.dataValues.avatar.thumbnailResource = await app
            .service('static-resource')
            .get(result.dataValues.avatar.thumbnailResourceId)
        } catch (err) {
          logger.error('error getting avatar model %o', err)
        }
      if (result.dataValues?.avatar.dataValues?.thumbnailResourceId)
        try {
          result.dataValues.avatar.dataValues.thumbnailResource = await app
            .service('static-resource')
            .get(result.dataValues.avatar.dataValues.thumbnailResourceId)
        } catch (err) {
          logger.error('error getting avatar model %o', err)
        }
    } else if (result.avatar) {
      if (result.avatar.modelResourceId)
        try {
          result.avatar.modelResource = await app.service('static-resource').get(result.avatar.modelResourceId)
        } catch (err) {
          logger.error('error getting avatar model %o', err)
        }
      if (result.avatar.dataValues?.modelResourceId)
        try {
          result.avatar.dataValues.modelResource = await app
            .service('static-resource')
            .get(result.avatar.dataValues.modelResourceId)
        } catch (err) {
          logger.error('error getting avatar model %o', err)
        }
      if (result.avatar.thumbnailResourceId)
        try {
          result.avatar.thumbnailResource = await app.service('static-resource').get(result.avatar.thumbnailResourceId)
        } catch (err) {
          logger.error('error getting avatar model %o', err)
        }
      if (result.avatar.dataValues?.thumbnailResourceId)
        try {
          result.avatar.dataValues.thumbnailResource = await app
            .service('static-resource')
            .get(result.avatar.dataValues.thumbnailResourceId)
        } catch (err) {
          logger.error('error getting avatar model %o', err)
        }
    }

    // if (result.data) {
    //   const mappedUsers = result.data.map(user => {
    //     return new Promise(async (resolve, reject) => {
    //       if (user.avatar) {
    //         if (user.avatar.modelResourceId)
    //           try {
    //             user.avatar.modelResource = await app.service('static-resource').get(user.avatar.modelResourceId)
    //             resolve(user)
    //           } catch (err) {
    //             logger.error('error getting avatar model %o', err)
    //             reject(err)
    //           }
    //         if (user.avatar.dataValues?.modelResourceId)
    //           try {
    //             user.avatar.dataValues.modelResource = await app
    //                 .service('static-resource')
    //                 .get(user.avatar.dataValues.modelResourceId)
    //             resolve(user)
    //           } catch (err) {
    //             logger.error('error getting avatar model %o', err)
    //             reject(err)
    //           }
    //         if (user.avatar.thumbnailResourceId)
    //           try {
    //             user.avatar.thumbnailResource = await app.service('static-resource').get(user.avatar.thumbnailResourceId)
    //             resolve(user)
    //           } catch (err) {
    //             logger.error('error getting avatar model %o', err)
    //             reject(err)
    //           }
    //         if (user.avatar.dataValues?.thumbnailResourceId)
    //           try {
    //             user.avatar.dataValues.thumbnailResource = await app
    //                 .service('static-resource')
    //                 .get(user.avatar.dataValues.thumbnailResourceId)
    //             resolve(user)
    //           } catch (err) {
    //             logger.error('error getting avatar model %o', err)
    //             reject(err)
    //           }
    //       }
    //       if (user.dataValues.avatar) {
    //         if (user.dataValues.avatar.modelResourceId)
    //           try {
    //             user.dataValues.avatar.modelResource = await app.service('static-resource').get(user.dataValues.avatar.modelResourceId)
    //             resolve(user)
    //           } catch (err) {
    //             logger.error('error getting avatar model %o', err)
    //             reject(err)
    //           }
    //         try {
    //           console.log('POPULATING MUTLI DATAVALUES MODELRESOURCE')
    //           user.dataValues.avatar.dataValues.modelResource = await app
    //               .service('static-resource')
    //               .get(user.dataValues.avatar.dataValues.modelResourceId)
    //           console.log('DONE POPULATED MUTLI DATAVALUES MODELRESOURCE', user, user.dataValues.avatar.dataValues)
    //           resolve(user)
    //         } catch (err) {
    //           logger.error('error getting avatar model %o', err)
    //           reject(err)
    //         }
    //         if (user.dataValues.avatar.thumbnailResourceId)
    //           try {
    //             user.dataValues.avatar.thumbnailResource = await app.service('static-resource').get(user.dataValues.avatar.thumbnailResourceId)
    //             resolve(user)
    //           } catch (err) {
    //             logger.error('error getting avatar model %o', err)
    //             reject(err)
    //           }
    //         if (user.dataValues.avatar.dataValues?.thumbnailResourceId)
    //           try {
    //             user.dataValues.avatar.dataValues.thumbnailResource = await app
    //                 .service('static-resource')
    //                 .get(user.dataValues.avatar.dataValues.thumbnailResourceId)
    //             resolve(user)
    //           } catch (err) {
    //             logger.error('error getting avatar model %o', err)
    //             reject(err)
    //           }
    //       }
    //     })
    //   })
    //   console.log('promises', mappedUsers)
    //   await Promise.all(mappedUsers)
    //   result.data = mappedUsers
    // }

    // if (!result.data) console.log('Returned result.avatar', result, result.avatar, result.avatar?.dataValues, result.dataValues?.avatar?.dataValues)
    // if (result.data && result.total > 0) console.log('nested user', result.data[0].avatar.dataValues)
    return context
  }
}

/**
 * This module used to declare and identify database relation
 * which will be used later in user service
 */

export default {
  before: {
    all: [authenticate()],
    find: [
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'user-api-key'
          },
          // {
          //   model: 'subscription'
          // },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          },
          {
            model: 'instance-attendance',
            as: 'instanceAttendance',
            where: {
              ended: false
            },
            required: false,
            include: [
              {
                model: 'instance',
                as: 'instance',
                include: [
                  {
                    model: 'location',
                    as: 'location'
                  }
                ]
              }
            ]
          },
          {
            model: 'scope'
          },
          {
            model: 'party'
          },
          {
            model: 'avatar'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'user-api-key'
          },
          // {
          //   model: 'subscription'
          // },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          },
          {
            model: 'scope'
          },
          {
            model: 'party'
          },
          {
            model: 'avatar'
          }
        ]
      }),
      iff(
        (context: HookContext) => context.params.user.id === context.arguments[0],
        addAssociations({
          models: [
            {
              model: 'instance-attendance',
              as: 'instanceAttendance',
              where: { ended: false },
              required: false,
              include: [
                {
                  model: 'instance',
                  as: 'instance',
                  include: [
                    {
                      model: 'location',
                      as: 'location'
                    }
                  ]
                }
              ]
            }
          ]
        })
      ),
      iff(
        (context: HookContext) => context.params.user.id !== context.arguments[0],
        (context: HookContext) => {
          if (!context.params.sequelize.attributes) context.params.sequelize.attributes = {}
          context.params.sequelize.attributes.exclude = ['partyId']
        }
      )
    ],
    create: [iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('user', 'write') as any)],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin') as any, verifyScope('user', 'write') as any)],
    patch: [
      iff(isProvider('external'), restrictUserPatch as any),
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          },
          {
            model: 'user-api-key'
          },
          // {
          //   model: 'subscription'
          // },
          {
            model: 'location-admin'
          },
          {
            model: 'location-ban'
          },
          {
            model: 'user-settings'
          },
          {
            model: 'scope'
          },
          {
            model: 'avatar'
          }
        ]
      }),
      addScopeToUser()
    ],
    remove: [iff(isProvider('external'), restrictUserRemove as any)]
  },

  after: {
    all: [],
    find: [parseAllUserSettings(), addAvatarResources()],
    get: [parseUserSettings(), addAvatarResources()],
    create: [parseUserSettings(), addAvatarResources()],
    update: [parseUserSettings(), addAvatarResources()],
    patch: [parseUserSettings(), addAvatarResources()],
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
