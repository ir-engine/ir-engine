import type { Application as ExpressFeathers } from '@feathersjs/express'
import Primus from 'primus'

import '@feathersjs/transport-commons'

import { ServiceTypes } from '@etherealengine/common/declarations'

export type PrimusType = Primus & {
  forEach(cb: (spark: Primus.Spark, id: string, connections: { [id: string]: Primus.Spark }) => boolean | void): Primus
  use(name: string, fn: (req: any, res: any, next: any) => void, level?: number): Primus
}

export type Application = ExpressFeathers<ServiceTypes> & {
  sync: any
  primus: PrimusType
  isSetup: Promise<boolean>
}
