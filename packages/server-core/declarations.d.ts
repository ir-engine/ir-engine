// src/declarations.d.ts
import type { Application as ExpressFeathers } from '@feathersjs/express'
import type * as x from '@feathersjs/feathers'
import '@feathersjs/transport-commons'
import * as k8s from '@kubernetes/client-node'
import type SocketIO from 'socket.io'

import { ServiceTypes } from '@xrengine/common/declarations'

import { SocketWebRTCServerNetwork } from '../instanceserver/src/SocketWebRTCServerNetwork'

export type Application = ExpressFeathers<ServiceTypes> & {
  // Common
  k8AgonesClient: k8s.CustomObjectsApi
  k8DefaultClient: k8s.CoreV1Api
  k8AppsClient: k8s.AppsV1Api
  k8BatchClient: k8s.BatchV1Api
  agonesSDK: any
  sync: any
  io: SocketIO.Server
  transport: SocketWebRTCServerNetwork
  seed: () => Application // function

  // Instanceserver
  instance: any
  isSubdomainNumber: string
  isChannelInstance: boolean
  instanceServer: any
  isSetup: Promise<boolean>
  restart: () => void

  // API Server
}
