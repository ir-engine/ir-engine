import { ServerSetting } from './ServerSetting'

export interface ServerSettingResult {
  data: ServerSetting[]
  total: number
  limit: number
  skip: number
}
