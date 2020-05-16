import IInstanceType from '../instancet-type.interface'
import { GraphQLObjectType, GraphQLList, GraphQLString } from 'graphql'
// @ts-ignore
import { attributeFields } from 'graphql-sequelize'

import { withFilter, PubSub } from 'graphql-subscriptions'

// @ts-ignore
import AgonesSDK from '@google-cloud/agones-sdk'

export default class UserInstance implements IInstanceType {
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
    findUserInstances: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'findUserInstances',
        description: 'Find user instances on a realtime server',
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
        return this.realtimeService.find({ type: 'user', query: query })
      }
    },
    getUserInstance: {
      type: new GraphQLObjectType({
        name: 'getUserInstance',
        description: 'Get a single user instance on a realtime server',
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
        return this.realtimeService.get(args.id, { type: 'user' })
      }
    },
    addUserInstance: {
      type: new GraphQLObjectType({
        name: 'addUserInstance',
        description: 'Add a user instance to this server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      args: {
        id: {
          type: GraphQLString
        },
        name: {
          type: GraphQLString
        }
      },
      resolve: async (source: any, args: any, context: any, info: any) => {
        if (Object.keys(this.realtimeService.store.user).length === 0) {
          await this.agonesSDK.allocate()
        }

        const newUser = await this.realtimeService.create({
          type: 'user',
          object: args
        })

        await this.pubSubInstance.publish('userInstanceCreated', {
          userInstanceCreated: args
        })

        return newUser
      }
    },
    patchUserInstance: {
      type: new GraphQLObjectType({
        name: 'patchUserInstance',
        description: 'Patch a user instance on this server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      args: {
        id: {
          type: GraphQLString
        },
        name: {
          type: GraphQLString
        },
        role: {
          type: GraphQLString
        }
      },
      resolve: async (source: any, args: any, context: any, info: any) => {
        const patchedUser = await this.realtimeService.patch(args.id, {
          type: 'user',
          object: args
        })

        await this.pubSubInstance.publish('userInstancePatched', {
          userInstancePatched: patchedUser
        })

        return patchedUser
      }
    },
    removeUserInstance: {
      type: new GraphQLObjectType({
        name: 'removeUserInstance',
        description: 'Remove a user instance from this server',
        fields: () => (this.idField)
      }),
      args: {
        id: {
          type: GraphQLString
        }
      },
      resolve: async (source: any, args: any, context: any, info: any) => {
        await this.realtimeService.remove(args.id, {
          type: 'user'
        })

        await this.pubSubInstance.publish('userInstanceRemoved', {
          userInstanceRemoved: args
        })

        if (Object.keys(this.realtimeService.store.user).length === 0) {
          this.agonesSDK.shutdown()
        }

        return args
      }
    }
  }

  subscriptions = {
    userInstanceCreated: {
      type: new GraphQLObjectType({
        name: 'userInstanceCreated',
        description: 'Listen for when users are added to this server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      subscribe: withFilter(
        () => this.pubSubInstance.asyncIterator('userInstanceCreated'),
        (payload, args) => {
          return true
        }
      )
    },
    userInstancePatched: {
      type: new GraphQLObjectType({
        name: 'userInstancePatched',
        description: 'Listen for when users are patched on this server',
        fields: () => ({
          ...attributeFields(this.model)
        })
      }),
      subscribe: withFilter(
        () => this.pubSubInstance.asyncIterator('userInstancePatched'),
        (payload, args) => {
          return true
        }
      )
    },
    userInstanceRemoved: {
      type: new GraphQLObjectType({
        name: 'userInstanceRemoved',
        description: 'Listen for when users are added to this server',
        fields: () => (this.idField)
      }),
      subscribe: withFilter(
        () => this.pubSubInstance.asyncIterator('userInstanceRemoved'),
        (payload, args) => {
          return true
        }
      )
    }
  }
}
