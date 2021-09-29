import { Application as ExpressFeathers } from '@feathersjs/express'

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<any> & {
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
