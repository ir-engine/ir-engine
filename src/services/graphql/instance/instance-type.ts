import IInstanceType from './instancet-type.interface'
import ComponentInstanceType from './instance-types/component.instance-type'
import EntityInstanceType from './instance-types/entity.instance-type'
import UserInstanceType from './instance-types/user.instance-type'
// @ts-ignore
import { PubSub } from 'graphql-subscriptions'
// @ts-ignore
import AgonesSDK from '@google-cloud/agones-sdk'
import { Application } from '../../../declarations'

export default class InstanceType implements IInstanceType {
  service: IInstanceType
  agonesSDK: AgonesSDK
  app: Application
  constructor (modelName: String, model: any, realtimeService: any, pubSubInstance: PubSub, agonesSDK: AgonesSDK, app: Application) {
    this.service = modelName === 'user' ? new UserInstanceType(model, realtimeService, pubSubInstance, agonesSDK, app) : modelName === 'component' ? new ComponentInstanceType(model, realtimeService, pubSubInstance, agonesSDK, app) : modelName === 'entity' ? new EntityInstanceType(model, realtimeService, pubSubInstance, agonesSDK, app) : new UserInstanceType(model, realtimeService, pubSubInstance, agonesSDK, app)
    this.mutations = this.service.mutations as any
    this.subscriptions = this.service.subscriptions
    this.agonesSDK = agonesSDK
    this.app = app
  }

  mutations = {}
  subscriptions = {}
}
