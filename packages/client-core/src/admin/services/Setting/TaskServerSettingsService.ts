import { Paginated } from '@feathersjs/feathers'

import { TaskServerSetting } from '@etherealengine/common/src/interfaces/TaskServerSetting'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../../API'
import { NotificationService } from '../../../common/services/NotificationService'

export const AdminTaskServerSettingsState = defineState({
  name: 'AdminTaskServerSettingsState',
  initial: () => ({
    taskservers: [] as Array<TaskServerSetting>,
    updateNeeded: true
  })
})

const fetchedTaskServersReceptor = (action: typeof AdminTaskServerSettingActions.fetchedTaskServers.matches._TYPE) => {
  const state = getMutableState(AdminTaskServerSettingsState)
  return state.merge({ taskservers: action.taskServerSettings.data, updateNeeded: false })
}

export const TaskServerSettingReceptors = {
  fetchedTaskServersReceptor
}

export const AdminSettingTaskServerService = {
  fetchSettingsTaskServer: async (inDec?: 'increment' | 'decrement') => {
    try {
      const taskServerSettings = (await API.instance.client
        .service('task-server-setting')
        .find()) as Paginated<TaskServerSetting>
      dispatchAction(AdminTaskServerSettingActions.fetchedTaskServers({ taskServerSettings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class AdminTaskServerSettingActions {
  static fetchedTaskServers = defineAction({
    type: 'ee.client.AdminTaskServerSetting.SETTING_ANALYIS_DISPLAY' as const,
    taskServerSettings: matches.object as Validator<unknown, Paginated<TaskServerSetting>>
  })
}
