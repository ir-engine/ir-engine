import { Dispatch } from 'redux'
import { redisSettingRetrieved } from './actions'
import { client } from '../../../../../feathers'
import { AlertService } from '../../../../../common/reducers/alert/AlertService'

export function fetchRedisSetting() {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const redisSetting = await client.service('redis-setting').find()
      dispatch(redisSettingRetrieved(redisSetting))
    } catch (err) {
      AlertService.dispatchAlertError(dispatch, err.message)
    }
  }
}
