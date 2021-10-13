import { RealityPackInterface } from './RealityPack'

export type RealityPackResult = {
  data: RealityPackInterface[]
  total: number
  limit: number
  skip: number
}
