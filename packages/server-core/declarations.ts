import type { Application as ExpressFeathers } from '@feathersjs/express'

import '@feathersjs/transport-commons'

import * as k8s from '@kubernetes/client-node'
import type SocketIO from 'socket.io'

import { ServiceTypes } from '@xrengine/common/declarations'
import { Instance } from '@xrengine/common/src/interfaces/Instance'

import { SocketWebRTCServerNetwork } from '../instanceserver/src/SocketWebRTCServerNetwork'

export const ServerMode = {
  API: 'API' as const,
  Instance: 'Instance' as const,
  Analytics: 'Analytics' as const
}

export type ServerTypeMode = typeof ServerMode[keyof typeof ServerMode]

export type Application = ExpressFeathers<ServiceTypes> & {
  // Common
  k8AgonesClient: k8s.CustomObjectsApi
  k8DefaultClient: k8s.CoreV1Api
  k8AppsClient: k8s.AppsV1Api
  k8BatchClient: k8s.BatchV1Api
  agonesSDK: any
  sync: any
  io: any //SocketIO.Server
  transport: SocketWebRTCServerNetwork
  seed: () => Application // function
  serverMode: ServerTypeMode

  // Instanceserver
  instance: any // todo: make type 'Instance'
  isSubdomainNumber: string
  isChannelInstance: boolean
  instanceServer: any
  isSetup: Promise<boolean>
  restart: () => void

  // API Server
}
