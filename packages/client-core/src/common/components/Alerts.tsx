import React from 'react'
import { connect } from 'react-redux'
import Alert from '@material-ui/lab/Alert'
import AlertTitle from '@material-ui/lab/AlertTitle'
import SvgIcon from '@material-ui/core/SvgIcon'
import { selectAlertState } from '../reducers/alert/selector'
import { alertCancel } from '../reducers/alert/service'
import { bindActionCreators, Dispatch } from 'redux'
import Box from '@material-ui/core/Box'
import styles from './Common.module.scss'

interface Props {
  alert: any
  alertCancel: typeof alertCancel
}

const mapStateToProps = (state: any): any => {
  return {
    alert: selectAlertState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  alertCancel: bindActionCreators(alertCancel, dispatch)
})

const AlertsComponent = (props: Props): any => {
  const { alert, alertCancel } = props

  const handleClose = (e: any): void => {
    e.preventDefault()
    alertCancel()
  }
  const type = alert.get('type')
  const message = alert.get('message')
  let svgtypeicon = ''
  let svgtypeclass = ''
  let alertBoxContainerclass = ''
  let alerttitle = ''

  if (type == 'success') {
    svgtypeicon = '/Notification_Success.svg'
    svgtypeclass = styles.svgiconsuccess
    alertBoxContainerclass = styles.alertBoxContainersuccess
    alerttitle = 'Event was successful'
  } else if (type == 'error') {
    svgtypeicon = '/Notification_Error.svg'
    svgtypeclass = styles.svgiconerror
    alertBoxContainerclass = styles.alertBoxContainererror
    alerttitle = 'An error was encountered'
  } else {
    svgtypeicon = '/Notification_InProgress.svg'
    svgtypeclass = styles.svgiconprogress
    alertBoxContainerclass = styles.alertBoxContainerprogress
    alerttitle = 'Event in progress'
  }

  return (
    <div className={styles.alertContainer}>
      {type === 'none' || message === '' ? (
        <Box />
      ) : (
        <Box m={1} className={styles.BoxContainer}>
          <Alert
            className={alertBoxContainerclass}
            variant="filled"
            severity={alert.get('type')}
            icon={<img src={svgtypeicon} className={svgtypeclass}></img>}
            onClose={(e) => handleClose(e)}
          >
            <div className={styles.divalertContainer}>
              <AlertTitle className={styles.alerttitle}>{alerttitle}</AlertTitle>
              {alert.get('message')}
            </div>
          </Alert>
        </Box>
      )}
    </div>
  )
}

const AlertsWrapper = (props: any): any => <AlertsComponent {...props} />

export const Alerts = connect(mapStateToProps, mapDispatchToProps)(AlertsWrapper)
