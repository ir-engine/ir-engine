import { Dispatch } from 'redux'
import { AdminRedisSettingAction } from './AdminRedisSettingActions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export const AdminRedisSettingService = {
  fetchRedisSetting: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const redisSetting = await client.service('redis-setting').find()
        dispatch(AdminRedisSettingAction.redisSettingRetrieved(redisSetting))
      } catch (err) {
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
