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
import { KnexAdapter } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import { Knex } from 'knex'
import slugify from 'slugify'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import {
  locationSettingPath,
  LocationSettingType
} from '@etherealengine/engine/src/schemas/social/location-setting.schema'
import {
  LocationData,
  LocationPatch,
  locationPath,
  LocationQuery,
  LocationType
} from '@etherealengine/engine/src/schemas/social/location.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LocationParams extends KnexAdapterParams<LocationQuery> {
  user?: UserInterface
}

/**
 * A class for Location service
 */

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
    const { joinableLocations, adminnedLocations, search } = params.query || {}

    if (joinableLocations) {
      const knexClient: Knex = this.app.get('knexClient')

      const locations = await knexClient
        .from(locationPath)
        .join('instance', 'instance.locationId', '=', `${locationPath}.id`)
        .andWhere('instance.ended', '=', false)
        .andWhere('instance.currentUsers', '<', `${locationPath}.maxUsersPerInstance`)
        .select(`${locationPath}.id`)

      params.query = {
        ...params.query,
        id: {
          $in: locations.map((location) => location.id)
        }
      }
    } else if (adminnedLocations && search) {
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

    return super._find(params)
  }

  /**
   * A function which is used to create new location
   *
   * @param data of location
   * @param params
   * @returns new location object
   */
  async create(data: any, params?: LocationParams) {
    const t = await this.app.get('sequelizeClient').transaction()
    const trx = await (this.app.get('knexClient') as Knex).transaction()

    try {
      // @ts-ignore
      let { locationSetting, ...locationData } = data
      const loggedInUser = params!.user as UserInterface
      locationData.slugifiedName = slugify(locationData.name, { lower: true })

      const selfUser = params?.user

      if (locationData.isLobby) await this.makeLobby(t, params)
      if (!selfUser || !selfUser.scopes || !selfUser.scopes.find((scope) => scope.type === 'admin:admin'))
        throw new Error('Only Admin can set Lobby')

      const location = await this.Model.create(locationData, { transaction: t })
      await trx.from<LocationSettingType>(locationSettingPath).insert({
        videoEnabled: !!locationSetting.videoEnabled,
        audioEnabled: !!locationSetting.audioEnabled,
        faceStreamingEnabled: !!locationSetting.faceStreamingEnabled,
        screenSharingEnabled: !!locationSetting.screenSharingEnabled,
        locationType: locationSetting.locationType || 'private',
        locationId: location.id
      })

      if (loggedInUser) {
        await Promise.all([
          this.app.service('location-admin').Model.create(
            {
              locationId: location.id,
              userId: loggedInUser.id
            },
            { transaction: t }
          ),
          this.app.service('location-authorized-user').Model.create(
            {
              locationId: location.id,
              userId: loggedInUser.id
            },
            { transaction: t }
          )
        ])
      }

      await t.commit()
      await trx.commit()

      return location as T
    } catch (err) {
      logger.error(err)
      await t.rollback()
      await trx.rollback()
      if (err.errors && err.errors[0].message === 'slugifiedName must be unique') {
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
  async patch(id: string, data: any, params?: LocationParams): Promise<T> {
    const t = await this.app.get('sequelizeClient').transaction()
    const trx = await (this.app.get('knexClient') as Knex).transaction()

    try {
      const selfUser = params?.user

      if (!old.isLobby && locationData.isLobby) await this.makeLobby(t, params)
      if (!selfUser || !selfUser.scopes || !selfUser.scopes.find((scope) => scope.type === 'admin:admin'))
        throw new Error('Only Admin can set Lobby')

      // @ts-ignore
      let { locationSetting, ...locationData } = data
      locationSetting ??= data['locationSetting']

      const old = await this.Model.findOne({
        where: { id },
        include: [createLocationSettingModel(this.app)]
      })

      if (locationData.name) locationData.slugifiedName = slugify(locationData.name, { lower: true })

      await this.Model.update(locationData, { where: { id }, transaction: t }) // super.patch(id, locationData, params);

      await trx
        .from<LocationSettingType>(locationSettingPath)
        .update({
          videoEnabled: !!locationSetting.videoEnabled,
          audioEnabled: !!locationSetting.audioEnabled,
          faceStreamingEnabled: !!locationSetting.faceStreamingEnabled,
          screenSharingEnabled: !!locationSetting.screenSharingEnabled,
          locationType: locationSetting.locationType || 'private'
        })
        .where({ id: old.locationSetting.id })

      await t.commit()
      await trx.commit()

      const location = await this.Model.findOne({
        where: { id },
        include: [createLocationSettingModel(this.app)]
      })

      return location as T
    } catch (err) {
      logger.error(err)
      await t.rollback()
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

      const selfUser = params!.user as UserInterface
      if (location.locationSetting) await this.app.service(locationSettingPath).remove(location.locationSetting.id)

      try {
        const locationAdminItems = await this.app.service('location-admin').Model.findAll({
          where: {
            locationId: id,
            userId: selfUser.id ?? null
          }
        })

        locationAdminItems.length &&
          locationAdminItems.forEach(async (route) => {
            await this.app.service('location-admin').remove(route.dataValues.id)
          })
      } catch (err) {
        logger.error(err, `Could not remove location-admin: ${err.message}`)
      }
    }

    return await super._remove(id)
  }
}
