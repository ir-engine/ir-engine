import { Application } from '../../../declarations'
import IInstanceType from './instancet-type.interface'
import UserInstanceType from './instance-types/user.instance-type'
// @ts-ignore
import { attributeFields } from 'graphql-sequelize'
import { PubSub } from 'graphql-subscriptions'

export default class InstanceType implements IInstanceType {
    service: IInstanceType
    constructor (modelName: String, model: any, realtimeService: any, pubSubInstance: PubSub) {
        this.service = modelName === 'user' ? new UserInstanceType(model, realtimeService, pubSubInstance) : new UserInstanceType(model, realtimeService, pubSubInstance)
        this.mutations = this.service.mutations as any
        this.subscriptions = this.service.subscriptions
    }

    mutations = {}
    subscriptions = {}
}
