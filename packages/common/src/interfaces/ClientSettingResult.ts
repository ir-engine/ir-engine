import { ClientSetting } from './ClientSetting'

export interface ClientSettingResult {
  data: ClientSetting[]
  total: number
  limit: number
  skip: number
}
