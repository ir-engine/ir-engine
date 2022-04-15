import React from 'react'
import { useTranslation } from 'react-i18next'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'

import { useAlertState } from '../services/AlertService'
import { AlertService } from '../services/AlertService'
import styles from './index.module.scss'

interface Props {}

const AlertsComponent = (props: Props): JSX.Element => {
  const { t } = useTranslation()
  const handleClose = (e: any): void => {
    e.preventDefault()
    AlertService.alertCancel()
  }
  const alert = useAlertState()
  const type = alert.type
  const message = alert.message
  let svgtypeicon = ''
  let svgtypeclass = ''
  let alertBoxContainerclass = ''
  let alerttitle = ''

  if (type.value == 'success') {
    svgtypeicon = '/Notification_Success.svg'
    svgtypeclass = styles.svgiconsuccess
    alertBoxContainerclass = styles.alertBoxContainersuccess
    alerttitle = t('common:alert.eventWasSuccess')
  } else if (type.value == 'error') {
    svgtypeicon = '/Notification_Error.svg'
    svgtypeclass = styles.svgiconerror
    alertBoxContainerclass = styles.alertBoxContainererror
    alerttitle = t('common:alert.errorWasEncountered')
  } else {
    svgtypeicon = '/Notification_InProgress.svg'
    svgtypeclass = styles.svgiconprogress
    alertBoxContainerclass = styles.alertBoxContainerprogress
    alerttitle = t('common:alert.eventInProgress')
  }

  return (
    <div className={styles.alertContainer}>
      {type.value === 'none' || message.value === '' ? (
        <Box />
      ) : (
        <Box m={1} className={styles.BoxContainer}>
          <Alert
            className={alertBoxContainerclass}
            variant="filled"
            severity={type.value}
            icon={<img src={svgtypeicon} className={svgtypeclass}></img>}
            onClose={(e) => handleClose(e)}
          >
            <div className={styles.divalertContainer}>
              <AlertTitle className={styles.alerttitle}>{alerttitle}</AlertTitle>
              {message.value}
            </div>
          </Alert>
        </Box>
      )}
    </div>
  )
}

const AlertsWrapper = (props: Props): JSX.Element => <AlertsComponent {...props} />

export const Alerts = AlertsWrapper
