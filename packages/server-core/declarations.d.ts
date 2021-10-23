// src/declarations.d.ts
import { Application as ExpressFeathers } from '@feathersjs/express'
import * as x from '@feathersjs/feathers'
import '@feathersjs/transport-commons'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {
  [x: string]: any // TODO: fix this
}

// TODO: fix sequlize typings for this
export interface Models {}

export type Application = ExpressFeathers<ServiceTypes> & {
  // Common
  k8AgonesClient: any
  k8DefaultClient: any
  agonesSDK: any
  sync: any

  // Gameserver
  instance: any
  gsSubdomainNumber: number
  isChannelInstance: boolean
  gsName: any
  isSetup: Promise<boolean>

  // API Server
}
