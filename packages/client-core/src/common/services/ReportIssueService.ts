import i18n from 'i18next'

import { client } from '../../feathers'
import { useDispatch } from '../../store'
import { AlertService } from './AlertService'

export const reportIssueService = {
  submitIssue: async (data: any) => {
    const dispatch = useDispatch
    try {
      await client.service('report-issue').create(data)
      AlertService.dispatchAlertSuccess(i18n.t('common:alert:submit-bug:report-success'))
    } catch (err) {
      AlertService.dispatchAlertError(new Error(i18n.t('common:alert:submit-bug:error')))
    }
  }
}
