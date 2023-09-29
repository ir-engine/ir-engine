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

import { Id, NullableId, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'
import { Knex } from 'knex'
import slugify from 'slugify'

import {
  locationSettingPath,
  LocationSettingType
} from '@etherealengine/engine/src/schemas/social/location-setting.schema'
import {
  LocationData,
  LocationDatabaseType,
  LocationPatch,
  locationPath,
  LocationQuery,
  LocationType
} from '@etherealengine/engine/src/schemas/social/location.schema'

import { locationAdminPath, LocationAdminType } from '@etherealengine/engine/src/schemas/social/location-admin.schema'
import {
  locationAuthorizedUserPath,
  LocationAuthorizedUserType
} from '@etherealengine/engine/src/schemas/social/location-authorized-user.schema'
import { UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'
import logger from '../../ServerLogger'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LocationParams extends RootParams<LocationQuery> {}

/**
 * A class for Location service
 */

export const locationSettingSorts = ['locationType', 'audioEnabled', 'videoEnabled']

export class LocationService<T = LocationType, ServiceParams extends Params = LocationParams> extends KnexAdapter<
  LocationType,
  LocationData,
  LocationParams,
  LocationPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: LocationParams) {
    return super._get(id, params)
  }

  /**
   * A function which help to find and display all locations
   *
   * @param params of query with limit number and skip number
   * @returns {@Array} of all locations
   */
  async find(params: LocationParams) {
    const { adminnedLocations, search } = params.query || {}

    if (adminnedLocations && search) {
      params.query = {
        ...params.query,
        $or: [
          {
            name: {
              $like: `%${search}%`
            }
          },
          {
            sceneId: {
              $like: `%${search}%`
            }
          }
        ]
      }
    }

    const paramsWithoutExtras = {
      ...params,
      // Explicitly cloned sort object because otherwise it was affecting default params object as well.
      query: params.query ? JSON.parse(JSON.stringify(params.query)) : {}
    }

    // Remove extra params
    if (paramsWithoutExtras.query?.adminnedLocations) delete paramsWithoutExtras.query.adminnedLocations
    if (paramsWithoutExtras.query?.search || paramsWithoutExtras.query?.search === '')
      delete paramsWithoutExtras.query.search

    // Remove location setting sorts
    if (paramsWithoutExtras.query?.$sort) {
      for (const sort of locationSettingSorts) {
        const hasLocationSettingSort = Object.keys(paramsWithoutExtras.query.$sort).find((item) => item === sort)

        if (hasLocationSettingSort) {
          delete paramsWithoutExtras.query.$sort[sort]
        }
      }
    }

    return super._find(paramsWithoutExtras)
  }

  /**
   * A function which is used to create new location
   *
   * @param data of location
   * @param params
   * @returns new location object
   */
  async create(data: LocationData, params?: LocationParams) {
    const trx = await (this.app.get('knexClient') as Knex).transaction()

    try {
      const selfUser = params?.user!

      if (data.isLobby) {
        await this.makeLobby(trx, selfUser)
      }

      data.slugifiedName = slugify(data.name, { lower: true })

      const insertData = JSON.parse(JSON.stringify(data))
      delete insertData.locationSetting
      delete insertData.locationAdmin

      await trx.from<LocationDatabaseType>(locationPath).insert(insertData)

      await trx.from<LocationSettingType>(locationSettingPath).insert({
        ...data.locationSetting,
        locationId: (data as LocationType).id
      })

      if ((data as LocationType).locationAdmin) {
        await trx.from<LocationAdminType>(locationAdminPath).insert({
          ...(data as LocationType).locationAdmin,
          userId: selfUser?.id,
          locationId: (data as LocationType).id
        })

        await trx.from<LocationAuthorizedUserType>(locationAuthorizedUserPath).insert({
          ...(data as LocationType).locationAdmin,
          userId: selfUser?.id,
          locationId: (data as LocationType).id
        })
      }

      await trx.commit()

      const location = await this.get((data as LocationType).id)

      return location
    } catch (err) {
      logger.error(err)
      await trx.rollback()
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Name is in use.')
      }
      throw err
    }
  }

  /**
   * A function which is used to update location
   *
   * @param id of location to update
   * @param data of location going to be updated
   * @returns updated location
   */
  async patch(id: Id, data: LocationPatch, params?: LocationParams) {
    const trx = await (this.app.get('knexClient') as Knex).transaction()

    try {
      const selfUser = params?.user

      const oldLocation = await this.app.service(locationPath).get(id)

      if (!oldLocation.isLobby && data.isLobby) {
        await this.makeLobby(trx, selfUser)
      }

      if (data.name) {
        data.slugifiedName = slugify(data.name, { lower: true })
      }

      const updateData = JSON.parse(JSON.stringify(data))
      delete updateData.locationSetting

      await trx.from<LocationDatabaseType>(locationPath).update(updateData).where({ id: id.toString() })

      if (data.locationSetting) {
        await trx
          .from<LocationSettingType>(locationSettingPath)
          .update({
            videoEnabled: data.locationSetting.videoEnabled,
            audioEnabled: data.locationSetting.audioEnabled,
            faceStreamingEnabled: data.locationSetting.faceStreamingEnabled,
            screenSharingEnabled: data.locationSetting.screenSharingEnabled,
            locationType: data.locationSetting.locationType || 'private'
          })
          .where({ id: oldLocation.locationSetting.id })
      }

      await trx.commit()

      const location = await this.get(id)

      return location
    } catch (err) {
      logger.error(err)
      await trx.rollback()
      if (err.errors && err.errors[0].message === 'slugifiedName must be unique') {
        throw new Error('That name is already in use')
      }
      throw err
    }
  }

  /**
   * A function which is used to remove location
   *
   * @param id of location which is going to be removed
   * @param params which contain user information
   * @returns {@function} of remove data
   */
  async remove(id: NullableId, params?: LocationParams) {
    if (id) {
      const location = await this.app.service(locationPath).get(id)

      if (location && location.isLobby) {
        throw new Error("Lobby can't be deleted")
      }

      const selfUser = params!.user
      if (location.locationSetting) await this.app.service(locationSettingPath).remove(location.locationSetting.id)

      try {
        await this.app.service(locationAdminPath).remove(null, {
          query: {
            locationId: id.toString(),
            userId: selfUser?.id
          }
        })
      } catch (err) {
        logger.error(err, `Could not remove location-admin: ${err.message}`)
      }
    }

    return await super._remove(id, params)
  }

  async makeLobby(trx: Knex.Transaction, selfUser?: UserType) {
    if (!selfUser || !selfUser.scopes || !selfUser.scopes.find((scope) => scope.type === 'admin:admin')) {
      throw new Error('Only Admin can set Lobby')
    }

    await trx.from<LocationDatabaseType>(locationPath).update({ isLobby: false }).where({ isLobby: true })
  }
}
