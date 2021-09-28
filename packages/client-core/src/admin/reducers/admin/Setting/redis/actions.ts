import { ADMIN_REDIS_SETTING_FETCHED } from '../../../actions'
export interface RedisSettingRetrieved {
  type: string
  list: any[]
}

export function redisSettingRetrieved(data): RedisSettingRetrieved {
  return {
    type: ADMIN_REDIS_SETTING_FETCHED,
    list: data
  }
}
