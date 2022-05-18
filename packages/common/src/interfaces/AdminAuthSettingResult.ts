import { AdminAuthSetting } from './AdminAuthSetting'

export interface AdminRedisSettingResult {
  data: AdminAuthSetting[]
  total: number
  limit: number
  skip: number
}
