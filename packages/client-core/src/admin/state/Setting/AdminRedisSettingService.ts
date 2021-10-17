import { AdminRedisSettingAction } from './AdminRedisSettingActions'
import { client } from '../../../feathers'
import { AlertService } from '../../../common/state/AlertService'
import { useDispatch } from '../../../store'

export const AdminRedisSettingService = {
  fetchRedisSetting: async () => {
    const dispatch = useDispatch()
    {
      try {
        const redisSetting = await client.service('redis-setting').find()
        dispatch(AdminRedisSettingAction.redisSettingRetrieved(redisSetting))
      } catch (err) {
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
