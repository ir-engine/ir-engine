import { Spark } from 'primus'

export interface Client {
  spark: Spark
  lastSeenTs: number
  joinTs: number
  media: any
  consumerLayers: any
  stats: any
}
