import { AdminAuthSetting } from './AdminAuthSetting'

export interface AdminAuthSettingResult {
  data: AdminAuthSetting[]
  total: number
  limit: number
  skip: number
}
