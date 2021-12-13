// src/declarations.d.ts
import { Application as ExpressFeathers } from '@feathersjs/express'
import * as x from '@feathersjs/feathers'
import '@feathersjs/transport-commons'
import { Request } from './src/k8s'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {
  [x: string]: any // TODO: fix this
}

// TODO: fix sequlize typings for this
export interface Models {}

export type Application = ExpressFeathers<ServiceTypes> & {
  // Common
  k8AgonesClient: Request
  k8DefaultClient: Request
  k8AppsClient: Request
  agonesSDK: any
  sync: any
  io: any
  seed: () => Application // function

  // Gameserver
  instance: any
  gsSubdomainNumber: number
  isChannelInstance: boolean
  gsName: any
  isSetup: Promise<boolean>
  restart: Function

  // API Server
}
