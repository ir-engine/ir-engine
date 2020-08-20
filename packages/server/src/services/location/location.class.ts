import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Params } from '@feathersjs/feathers'

export class Location extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create (data: any, params: Params): Promise<any> {
    console.log(data)
    const { id } = data

    if (id) {
      await this.app.service('location').get(id).then((existingLocation: any) => {
        new Promise((resolve) =>
          setTimeout(() => resolve(super.update(id, data, params)), 1000)
        ).then((updatedLocation: any) => {
          this.createInstances({ id: updatedLocation.id, instance: data.instance }).then(() => {}, () => {})
        }, (reason: any) => {
          console.error(reason)
        })
      }, (newLoc: any) => {
        this.createNewLocation({ data, params }).then(() => {}, () => {})
      })
    } else {
      this.createNewLocation({ data, params }).then(() => {}, () => {})
    }

    return 'success'
  }

  async createNewLocation ({ data, params }: { data: any; params: Params }): Promise<any> {
    await new Promise((resolve) =>
      setTimeout(() => resolve(super.create(data, params)), 1000)
    ).then((updatedLocation: any) => {
      this.createInstances({ id: updatedLocation.id, instance: data.instance }).then(() => {}, () => {})
    }, (reason: any) => {
      console.error(reason)
    })
  }

  async createInstances ({ id, instance }: { id: any; instance: any }): Promise<any> {
    if (instance) {
      await instance.forEach((element: any) => {
        if (element.id) {
          this.app.services.instance.get(element.id).then((existingInstance: any) => {
            element.locationId = id
            new Promise((resolve) =>
              setTimeout(() =>
                resolve(this.app.services.instance.update(existingInstance.id, element)), 1000)).then((value: any) => {
              console.log(value)
            }, (reasone: any) => {
              console.error(reasone)
            })
          }, (newIns: any) => {
            element.locationId = id
            new Promise((resolve) =>
              setTimeout(() =>
                resolve(this.app.services.instance.create(element)), 1000)).then((value: any) => {
              console.log(value)
            }, (reasone: any) => {
              console.error(reasone)
            })
          })
        } else {
          element.locationId = id
          new Promise((resolve) =>
            setTimeout(() =>
              resolve(this.app.services.instance.create(element)), 1000)).then((value: any) => {
            console.log(value)
          }, (reasone: any) => {
            console.error(reasone)
          })
        }
      })
    }
  }
}
