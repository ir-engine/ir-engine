import type { Application as ExpressFeathers } from '@feathersjs/express'
// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import { HookContext as FeathersHookContext } from '@feathersjs/feathers'
import Primus from 'primus'

import '@feathersjs/transport-commons'

import * as k8s from '@kubernetes/client-node'

import { ServiceTypes } from '@etherealengine/common/declarations'

import { SocketWebRTCServerNetwork } from '../instanceserver/src/SocketWebRTCServerNetwork'

export const ServerMode = {
  API: 'API' as const,
  Instance: 'Instance' as const,
  Task: 'Task' as const
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
  primus: Primus
  network: SocketWebRTCServerNetwork
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

// The context for hook functions - can be typed with a service class
export type HookContext<S = any> = FeathersHookContext<Application, S>
