import { Location as LocationType } from '@standardcreative/common/src/interfaces/Location'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import Sequelize, { Op } from 'sequelize'
import slugify from 'slugify'

export class Location extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // async create (data: any, params: Params): Promise<any> {
  //   console.log(data);
  //   const { id } = data;
  //
  //   if (id) {
  //     await this.app.service('location').get(id).then((existingLocation: any) => {
  //       new Promise((resolve) =>
  //         setTimeout(() => resolve(super.update(id, data, params)), 1000)
  //       ).then((updatedLocation: any) => {
  //         this.createInstances({ id: updatedLocation.id, instance: data.instance }).then(() => {}, () => {});
  //       }, (reason: any) => {
  //         console.error(reason);
  //       });
  //     }, (newLoc: any) => {
  //       this.createNewLocation({ data, params }).then(() => {}, () => {});
  //     });
  //   } else {
  //     this.createNewLocation({ data, params }).then(() => {}, () => {});
  //   }
  //
  //   return 'success';
  // }

  /**
   * A method which is used to create new location
   *
   * @param param0 data of new location
   * @author Vyacheslav Solovjov
   */

  async createNewLocation({ data, params }: { data: any; params: Params }): Promise<any> {
    await new Promise((resolve) => setTimeout(() => resolve(super.create(data, params)), 1000)).then(
      (updatedLocation: any) => {
        this.createInstances({ id: updatedLocation.id, instance: data.instance }).then(
          () => {},
          () => {}
        )
      },
      (reason: any) => {
        console.error(reason)
      }
    )
  }

  /**
   * A function which is used to create new instance
   *
   * @param param0 data of instance
   * @author Vyacheslav Solovjov
   */
  async createInstances({ id, instance }: { id: any; instance: any }): Promise<any> {
    if (instance) {
      await instance.forEach((element: any) => {
        if (element.id) {
          this.app.services.instance.get(element.id).then(
            (existingInstance: any) => {
              element.locationId = id
              new Promise((resolve) =>
                setTimeout(() => resolve(this.app.services.instance.update(existingInstance.id, element)), 1000)
              ).then(
                (value: any) => {
                  console.log(value)
                },
                (reasone: any) => {
                  console.error(reasone)
                }
              )
            },
            (newIns: any) => {
              element.locationId = id
              new Promise((resolve) =>
                setTimeout(() => resolve(this.app.services.instance.create(element)), 1000)
              ).then(
                (value: any) => {
                  console.log(value)
                },
                (reasone: any) => {
                  console.error(reasone)
                }
              )
            }
          )
        } else {
          element.locationId = id
          new Promise((resolve) => setTimeout(() => resolve(this.app.services.instance.create(element)), 1000)).then(
            (value: any) => {
              console.log(value)
            },
            (reason: any) => {
              console.error(reason)
            }
          )
        }
      })
    }
  }

  /**
   * A function which help to find and display all locations
   *
   * @param params of query with limit number and skip number
   * @returns {@Array} of all locations
   * @author Vyacheslav Solovjov
   */
  async find(params: Params): Promise<any> {
    let { $skip, $limit, $sort, joinableLocations, adminnedLocations, search, ...strippedQuery } = params.query

    if ($skip == null) $skip = 0
    if ($limit == null) $limit = 10

    const order = []
    if ($sort != null)
      Object.keys($sort).forEach((name, val) => {
        order.push([name, $sort[name] === -1 ? 'DESC' : 'ASC'])
      })

    if (joinableLocations) {
      const locationResult = await (this.app.service('location') as any).Model.findAndCountAll({
        offset: $skip,
        limit: $limit,
        where: strippedQuery,
        order: order,
        include: [
          {
            model: (this.app.service('instance') as any).Model,
            required: false,
            where: {
              currentUsers: {
                [Op.lt]: Sequelize.col('location.maxUsersPerInstance')
              },
              ended: false
            }
          },
          {
            model: (this.app.service('location-settings') as any).Model,
            required: false
          },
          {
            model: (this.app.service('location-ban') as any).Model,
            required: false
          }
        ]
      })
      return {
        skip: $skip,
        limit: $limit,
        total: locationResult.count,
        data: locationResult.rows
      }
    } else if (adminnedLocations) {
      const loggedInUser = extractLoggedInUserFromParams(params)
      const selfUser = await this.app.service('user').get(loggedInUser.userId)
      const include = [
        {
          model: (this.app.service('location-settings') as any).Model,
          required: false
        },
        {
          model: (this.app.service('location-ban') as any).Model,
          required: false
        }
      ]

      if (selfUser.userRole !== 'admin') {
        ;(include as any).push({
          model: (this.app.service('location-admin') as any).Model,
          where: {
            userId: loggedInUser.userId
          }
        })
      }

      let q = {}

      if (search) {
        q = {
          [Op.or]: [
            Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), {
              [Op.like]: '%' + search.toLowerCase() + '%'
            }),
            Sequelize.where(Sequelize.fn('lower', Sequelize.col('sceneId')), {
              [Op.like]: '%' + search.toLowerCase() + '%'
            })
          ]
        }
      }
      const locationResult = await (this.app.service('location') as any).Model.findAndCountAll({
        offset: $skip,
        limit: $limit,
        where: { ...strippedQuery, ...q },
        order: order,
        include: include
      })
      return {
        skip: $skip,
        limit: $limit,
        total: locationResult.count,
        data: locationResult.rows
      }
    } else {
      return super.find(params)
    }
  }

  /**
   * A function which is used to create new location
   *
   * @param data of location
   * @param params
   * @returns new location object
   * @author Vyacheslav Solovjov
   */
  async create(data: LocationType, params: Params): Promise<any> {
    const t = await this.app.get('sequelizeClient').transaction()

    try {
      // eslint-disable-next-line prefer-const
      let { location_settings, ...locationData } = data
      const loggedInUser = extractLoggedInUserFromParams(params)
      locationData.slugifiedName = slugify(locationData.name, { lower: true })

      if (locationData.isLobby) await this.makeLobby(params, t)

      const location = await this.Model.create(locationData, { transaction: t })
      await (this.app.service('location-settings') as any).Model.create(
        {
          videoEnabled: !!location_settings.videoEnabled,
          audioEnabled: !!location_settings.audioEnabled,
          faceStreamingEnabled: !!location_settings.faceStreamingEnabled,
          screenSharingEnabled: !!location_settings.screenSharingEnabled,
          instanceMediaChatEnabled: !!location_settings.instanceMediaChatEnabled,
          maxUsersPerInstance: locationData.maxUsersPerInstance || 10,
          locationType: location_settings.locationType || 'private',
          locationId: location.id
        },
        { transaction: t }
      )

      if (loggedInUser) {
        await (this.app.service('location-admin') as any).Model.create(
          {
            locationId: location.id,
            userId: loggedInUser.userId
          },
          { transaction: t }
        )
      }

      await t.commit()

      return location
    } catch (err) {
      console.log(err)
      await t.rollback()
      if (err.errors[0].message === 'slugifiedName must be unique') {
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
   * @author Vyacheslav Solovjov
   */
  async patch(id: string, data: LocationType, params: Params): Promise<any> {
    const t = await this.app.get('sequelizeClient').transaction()

    try {
      // eslint-disable-next-line prefer-const
      let { location_settings, ...locationData } = data

      const old = await this.Model.findOne({
        where: { id },
        include: [(this.app.service('location-settings') as any).Model]
      })

      if (locationData.name) locationData.slugifiedName = slugify(locationData.name, { lower: true })
      if (!old.isLobby && locationData.isLobby) await this.makeLobby(params, t)

      await this.Model.update(locationData, { where: { id }, transaction: t }) // super.patch(id, locationData, params);

      await (this.app.service('location-settings') as any).Model.update(
        {
          videoEnabled: !!location_settings.videoEnabled,
          audioEnabled: !!location_settings.audioEnabled,
          faceStreamingEnabled: !!location_settings.faceStreamingEnabled,
          screenSharingEnabled: !!location_settings.screenSharingEnabled,
          instanceMediaChatEnabled: !!location_settings.instanceMediaChatEnabled,
          maxUsersPerInstance: locationData.maxUsersPerInstance || 10,
          locationType: location_settings.locationType || 'private'
        },
        { where: { id: old.location_settings.id }, transaction: t }
      )

      await t.commit()
      const location = await this.Model.findOne({
        where: { id },
        include: [(this.app.service('location-settings') as any).Model]
      })

      return location
    } catch (err) {
      console.log(err)
      await t.rollback()
      if (err.errors[0].message === 'slugifiedName must be unique') {
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
   * @author Vyacheslav Solovjov
   */

  async remove(id: string, params: Params): Promise<any> {
    if (id != null) {
      const loggedInUser = extractLoggedInUserFromParams(params)
      const location = await this.app.service('location').get(id)
      if (location.locationSettingsId != null)
        await this.app.service('location-settings').remove(location.locationSettingsId)
      try {
        await this.app.service('location-admin').remove(null, {
          query: {
            locationId: id,
            userId: loggedInUser.userId
          }
        })
      } catch (err) {
        console.log('Could not remove location-admin')
      }
    }
    return super.remove(id)
  }

  async makeLobby(params: Params, t): Promise<void> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const selfUser = await this.app.service('user').get(loggedInUser.userId)

    if (!selfUser || selfUser.userRole !== 'admin') throw new Error('Only Admin can set Lobby')

    await this.Model.update({ isLobby: false }, { where: { isLobby: true }, transaction: t })
  }
}
