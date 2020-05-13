import { RealtimeStore } from "../../../realtime-store/realtime-store.class";
import IInstanceType from '../instancet-type.interface'
import { GraphQLObjectType, GraphQLList } from "graphql";
// @ts-ignore
import { attributeFields } from 'graphql-sequelize'
import { GraphQLString } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { PubSub} from "graphql-subscriptions";

export default class InstanceUser implements IInstanceType {
    model: any
    pubSubInstance: PubSub
    realtimeService: any
    constructor(model: any, realtimeService: any, pubSubInstance: PubSub){
        this.model = model
        this.pubSubInstance = pubSubInstance
        this.realtimeService = realtimeService
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

            },
            resolve: async(source: any, args: any, context: any, info: any) => {
                return [
                    {
                        id: '1234abcd',
                        name: 'Pants McGee'
                    }
                ]
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

            },
            resolve: async(source: any, args: any, context: any, info: any) => {
                return {
                    id: '1234abcd',
                    name: 'Pants McGee'
                }
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
                userId: {
                    type: GraphQLString
                },
                name: {
                    type: GraphQLString
                }
            },
            resolve: async(source: any, args: any, context: any, info: any) => {
                await this.realtimeService.create({
                    type: 'user',
                    object: {
                        id: args.userId,
                        name: args.name || 'Dummy user'
                    }
                })

                this.pubSubInstance.publish('userInstanceCreated', {
                    userInstanceCreated: {
                        id: args.userId,
                        name: args.name || 'Dummy user'
                    }
                })
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
                    console.log(payload)
                    console.log(args)

                    return true
                }
            )
        }
    }
}
