import { AdminAwsSetting } from './AdminAwsSetting'

export interface AdminRedisSettingResult {
  data: AdminAwsSetting[]
  total: number
  limit: number
  skip: number
}
