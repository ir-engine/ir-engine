import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Params } from '@feathersjs/feathers';
import {extractLoggedInUserFromParams} from "../auth-management/auth-management.utils";
import Sequelize, { Op } from 'sequelize';
import slugify from 'slugify';

export class Location extends Service {
  app: Application
  docs: any

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
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

  async createNewLocation ({ data, params }: { data: any; params: Params }): Promise<any> {
    await new Promise((resolve) =>
      setTimeout(() => resolve(super.create(data, params)), 1000)
    ).then((updatedLocation: any) => {
      this.createInstances({ id: updatedLocation.id, instance: data.instance }).then(() => {}, () => {});
    }, (reason: any) => {
      console.error(reason);
    });
  }

  /**
   * A function which is used to create new instance 
   * 
   * @param param0 data of instance 
   * @author Vyacheslav Solovjov
   */
  async createInstances ({ id, instance }: { id: any; instance: any }): Promise<any> {
    if (instance) {
      await instance.forEach((element: any) => {
        if (element.id) {
          this.app.services.instance.get(element.id).then((existingInstance: any) => {
            element.locationId = id;
            new Promise((resolve) =>
              setTimeout(() =>
                resolve(this.app.services.instance.update(existingInstance.id, element)), 1000)).then((value: any) => {
              console.log(value);
            }, (reasone: any) => {
              console.error(reasone);
            });
          }, (newIns: any) => {
            element.locationId = id;
            new Promise((resolve) =>
              setTimeout(() =>
                resolve(this.app.services.instance.create(element)), 1000)).then((value: any) => {
              console.log(value);
            }, (reasone: any) => {
              console.error(reasone);
            });
          });
        } else {
          element.locationId = id;
          new Promise((resolve) =>
            setTimeout(() =>
              resolve(this.app.services.instance.create(element)), 1000)).then((value: any) => {
            console.log(value);
          }, (reason: any) => {
            console.error(reason);
          });
        }
      });
    }
  }

  /**
   * A function which help to find and display all locations
   * 
   * @param params of query with limit number and skip number 
   * @returns {@Array} of all locations 
   * @author Vyacheslav Solovjov
   */
  async find (params: Params): Promise<any> {
    // eslint-disable-next-line prefer-const
    let {$skip, $limit, $sort, ...strippedQuery} = params.query;
    if ($skip == null) $skip = 0;
    if ($limit == null) $limit = 10;
    const order = [];
    if ($sort != null) Object.keys($sort).forEach((name, val) => {
      order.push([name, $sort[name] === -1 ? 'DESC' : 'ASC']);
    });
    if (strippedQuery.joinableLocations != null) {
      delete strippedQuery.joinableLocations;
      const locationResult = await this.app.service('location').Model.findAndCountAll({
        offset: $skip,
        limit: $limit,
        where: strippedQuery,
        order: order,
        include: [
          {
            model: this.app.service('instance').Model,
            required: false,
            where: {
              currentUsers: {
                [Op.lt]: Sequelize.col('location.maxUsersPerInstance')
              }
            }
          },
          {
            model: this.app.service('location-settings').Model,
            required: false
          },
          {
            model: this.app.service('location-ban').Model,
            required: false
          }
        ]
      });
      return {
        skip: $skip,
        limit: $limit,
        total: locationResult.count,
        data: locationResult.rows
      };
    } else if (strippedQuery.adminnedLocations != null) {
      delete strippedQuery.adminnedLocations;
      const loggedInUser = extractLoggedInUserFromParams(params);
      const selfUser = await this.app.service('user').get(loggedInUser.userId);
      const include = [
        {
          model: this.app.service('location-settings').Model,
          required: false
        },
        {
          model: this.app.service('location-ban').Model,
          required: false
        }
      ];

      if (selfUser.userRole !== 'admin')  {
        (include as any).push(
            {
              model: this.app.service('location-admin').Model,
              where: {
                userId: loggedInUser.userId
              }
            });
      }

      const locationResult = await this.app.service('location').Model.findAndCountAll({
        offset: $skip,
        limit: $limit,
        where: strippedQuery,
        order: order,
        include: include
      });
      return {
        skip: $skip,
        limit: $limit,
        total: locationResult.count,
        data: locationResult.rows
      };
    } else{
      return super.find(params);
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
  async create (data: any, params: Params): Promise<any> {
    let location;
    // eslint-disable-next-line prefer-const
    let {location_setting, ...locationData} = data;
    const loggedInUser = extractLoggedInUserFromParams(params);
    locationData.slugifiedName = slugify(locationData.name, {
      lower: true
    });
    try {
      location = await super.create(locationData, params);
    } catch(err) {
      console.log(err);
      if (err.errors[0].message === 'slugifiedName must be unique') {
        throw new Error('That name is already in use');
      }
      throw err;
    }

    if (location_setting == null) location_setting = {};
    if (location_setting.videoEnabled == null) location_setting.videoEnabled = false;
    if (location_setting.instanceMediaChatEnabled == null) location_setting.instanceMediaChatEnabled = false;
    if (location_setting.maxUsersPerInstance == null) location_setting.maxUsersPerInstance = 10;
    if (location_setting.locationType == null) location_setting.locationType = 'private';
    location_setting.locationId = location.id;
    const locationSettings = await this.app.service('location-settings').create(location_setting);
    if(loggedInUser)
    await this.app.service('location-admin').create({
      locationId: location.id,
      userId: loggedInUser.userId
    });
    return super.patch(location.id, {
      locationSettingsId: locationSettings.id
    });
  }

  /**
   * A function which is used to update location 
   * 
   * @param id of location to update 
   * @param data of location going to be updated 
   * @param params 
   * @returns updated location
   * @author Vyacheslav Solovjov
   */
  async patch (id: string, data: any, params: Params): Promise<any> {
    let location;
    // eslint-disable-next-line prefer-const
    let {location_setting, ...locationData} = data;
    if (locationData.name) locationData.slugifiedName = slugify(locationData.name, {
      lower: true
    });

    try {
      location = await super.patch(id, locationData, params);
    } catch(err) {
      console.log(err);
      if (err.errors[0].message === 'slugifiedName must be unique') {
        throw new Error('That name is already in use');
      }
      throw err;
    }

    if (location_setting == null) location_setting = {};
    if (location_setting.videoEnabled == null) location_setting.videoEnabled = false;
    if (location_setting.instanceMediaChatEnabled == null) location_setting.instanceMediaChatEnabled = false;
    if (location_setting.maxUsersPerInstance == null) location_setting.maxUsersPerInstance = 10;
    if (location_setting.locationType == null) location_setting.locationType = 'private';
    location_setting.locationId = location.id;
    await this.app.service('location-settings').patch(location.locationSettingsId, location_setting);
    return location;
  }
  /**
   * A function which is used to remove location
   * 
   * @param id of location which is going to be removed 
   * @param params which contain user information 
   * @returns {@function} of remove data 
   * @author Vyacheslav Solovjov
   */

  async remove (id: string, params: Params): Promise<any> {
    if (id != null) {
      const loggedInUser = extractLoggedInUserFromParams(params);
      const location = await this.app.service('location').get(id);
      if (location.locationSettingsId != null) await this.app.service('location-settings').remove(location.locationSettingsId);
      try {
        await this.app.service('location-admin').remove(null, {
          query: {
            locationId: id,
            userId: loggedInUser.userId
          }
        });
      } catch(err) {
        console.log('Could not remove location-admin');
      }
    }
    return super.remove(id);
  }
}
