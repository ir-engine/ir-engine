import { Application } from '../../declarations'
import { Entity } from '../entity/entity.class'
import { IResolvers } from 'graphql-tools'

export default class Resolver {
  EntityService: Entity

  app: Application

  constructor (app: Application) {
    this.app = app
    this.EntityService = app.service('entity')
  }

  resolve = (): IResolvers<any, any> => {
    const EntityService = this.EntityService
    return {
      RootQuery: {
        async allEntities (root: any, args: any, context: any) {
          return await EntityService.find({})
        },
        async entities (root: any, { collection }: any, context: any) {
          return await EntityService.find({
            query: {
              collection
            }
          })
        },
        async entity (root: any, { _id }: any, context: any) {
          return await EntityService.get(_id)
        }
      },

      RootMutation: {
        async createEntity (root: any, data: any, context: any) {
          return await EntityService.create(data)
        }
      }
    }
  }
}
