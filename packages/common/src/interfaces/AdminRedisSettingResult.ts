import { AdminRedisSetting } from './AdminRedisSetting'

export interface AdminRedisSettingResult {
  data: AdminRedisSetting[]
  total: number
  limit: number
  skip: number
}
