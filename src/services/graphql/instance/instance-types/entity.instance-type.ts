import IInstanceType from '../instancet-type.interface'
import { GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql'
// @ts-ignore
import { attributeFields } from 'graphql-sequelize'

import { withFilter, PubSub } from 'graphql-subscriptions'

// @ts-ignore
import AgonesSDK from '@google-cloud/agones-sdk'

export default class EntityInstance implements IInstanceType {
  model: any
  idField: any
  pubSubInstance: PubSub
  realtimeService: any
  agonesSDK: AgonesSDK
  constructor (model: any, realtimeService: any, pubSubInstance: PubSub, agonesSDK: AgonesSDK) {
    this.model = model
    this.idField = { id: attributeFields(model).id }
    this.pubSubInstance = pubSubInstance
    this.realtimeService = realtimeService
    this.agonesSDK = agonesSDK
  }

  mutations = {
    findEntityInstances: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'findEntityInstances',
        description: 'Find entity instances on a realtime server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      })),
      args: {
        query: {
          type: GraphQLString
        }
      },
      resolve: async (source: any, args: any, context: any, info: any) => {
        console.log(args.query)
        const query = JSON.parse(args.query)
        return this.realtimeService.find({ type: 'entity', query: query })
      }
    },
    getEntityInstance: {
      type: new GraphQLObjectType({
        name: 'getEntityInstance',
        description: 'Get a single entity instance on a realtime server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      args: {
        id: {
          type: GraphQLString
        }
      },
      resolve: async (source: any, args: any, context: any, info: any) => {
        return this.realtimeService.get(args.id, { type: 'entity' })
      }
    },
    addEntityInstance: {
      type: new GraphQLObjectType({
        name: 'addEntityInstance',
        description: 'Add a entity instance to this server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      args: {
        id: {
          type: GraphQLString
        },
        data: {
          type: GraphQLString
        }
      },
      resolve: async (source: any, args: any, context: any, info: any) => {
        const newEntity = await this.realtimeService.create({
          type: 'entity',
          object: args
        })

        await this.pubSubInstance.publish('entityInstanceCreated', {
          entityInstanceCreated: args
        })

        return newEntity
      }
    },
    patchEntityInstance: {
      type: new GraphQLObjectType({
        name: 'patchEntityInstance',
        description: 'Patch a entity instance on this server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      args: {
        id: {
          type: GraphQLString
        },
        data: {
          type: GraphQLString
        }
      },
      resolve: async (source: any, args: any, context: any, info: any) => {
        const patchedEntity = await this.realtimeService.patch(args.id, {
          type: 'entity',
          object: args
        })

        await this.pubSubInstance.publish('entityInstancePatched', {
          entityInstancePatched: patchedEntity
        })

        return patchedEntity
      }
    },
    removeEntityInstance: {
      type: new GraphQLObjectType({
        name: 'removeEntityInstance',
        description: 'Remove a entity instance from this server',
        fields: () => (this.idField)
      }),
      args: {
        id: {
          type: GraphQLString
        }
      },
      resolve: async (source: any, args: any, context: any, info: any) => {
        await this.realtimeService.remove(args.id, {
          type: 'entity'
        })

        await this.pubSubInstance.publish('entityInstanceRemoved', {
          entityInstanceRemoved: args
        })

        return args
      }
    }
  }

  subscriptions = {
    entityInstanceCreated: {
      type: new GraphQLObjectType({
        name: 'entityInstanceCreated',
        description: 'Listen for when entitys are added to this server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      subscribe: withFilter(
        () => this.pubSubInstance.asyncIterator('entityInstanceCreated'),
        (payload, args) => {
          return true
        }
      )
    },
    entityInstancePatched: {
      type: new GraphQLObjectType({
        name: 'entityInstancePatched',
        description: 'Listen for when entitys are patched on this server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      subscribe: withFilter(
        () => this.pubSubInstance.asyncIterator('entityInstancePatched'),
        (payload, args) => {
          return true
        }
      )
    },
    entityInstanceRemoved: {
      type: new GraphQLObjectType({
        name: 'entityInstanceRemoved',
        description: 'Listen for when entitys are added to this server',
        fields: () => (this.idField)
      }),
      subscribe: withFilter(
        () => this.pubSubInstance.asyncIterator('entityInstanceRemoved'),
        (payload, args) => {
          return true
        }
      )
    }
  }
}
