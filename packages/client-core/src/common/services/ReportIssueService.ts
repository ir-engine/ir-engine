import i18n from 'i18next'

import { useDispatch } from '../../store'
import { AlertService } from './AlertService'

export const reportIssueService = {
  submitIssue: async () => {
    const dispatch = useDispatch
    try {
      AlertService.dispatchAlertSuccess(i18n.t('common:alert:submit-bug:report-success'))
    } catch (err) {
      AlertService.dispatchAlertError(new Error(i18n.t('common:alert:submit-bug:error')))
    }
  }
}
