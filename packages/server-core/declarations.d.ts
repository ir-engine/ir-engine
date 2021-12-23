// src/declarations.d.ts
import type { Application as ExpressFeathers } from '@feathersjs/express'
import type * as x from '@feathersjs/feathers'
import '@feathersjs/transport-commons'
import type { Request } from './src/k8s'
import type SocketIO from 'socket.io'
import { SocketWebRTCServerTransport } from '../gameserver/src/SocketWebRTCServerTransport'

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
  io: SocketIO.Server
  transport: SocketWebRTCServerTransport
  seed: () => Application // function

  // Gameserver
  instance: any
  gsSubdomainNumber: string
  isChannelInstance: boolean
  gameServer: any
  isSetup: Promise<boolean>
  restart: Function

  // API Server
}
