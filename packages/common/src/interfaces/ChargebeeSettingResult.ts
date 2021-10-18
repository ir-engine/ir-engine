import { ChargebeeSetting } from './ChargebeeSetting'

export interface ChargebeeSettingResult {
  data: ChargebeeSetting[]
  total: number
  limit: number
  skip: number
}
