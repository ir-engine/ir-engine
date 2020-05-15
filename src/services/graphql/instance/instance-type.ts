import { Application } from '../../../declarations'
import IInstanceType from './instancet-type.interface'
import UserInstanceType from './instance-types/user.instance-type'
// @ts-ignore
import { attributeFields } from 'graphql-sequelize'
import { PubSub } from 'graphql-subscriptions'
// @ts-ignore
import AgonesSDK from '@google-cloud/agones-sdk'

export default class InstanceType implements IInstanceType {
    service: IInstanceType
    agonesSDK: AgonesSDK
    constructor (modelName: String, model: any, realtimeService: any, pubSubInstance: PubSub, agonesSDK: AgonesSDK) {
        this.service = modelName === 'user' ? new UserInstanceType(model, realtimeService, pubSubInstance, agonesSDK) : new UserInstanceType(model, realtimeService, pubSubInstance, agonesSDK)
        this.mutations = this.service.mutations as any
        this.subscriptions = this.service.subscriptions
        this.agonesSDK = agonesSDK
    }

    mutations = {}
    subscriptions = {}
}
