import { FeathersApplication } from '@feathersjs/feathers'
import { ServiceTypes } from '../declarations'

export const API = {
  instance: null! as FeathersApplication<ServiceTypes>
}
