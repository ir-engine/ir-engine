import React, { Fragment, PureComponent } from 'react'
import { connect } from 'react-redux'
import Alert from '@material-ui/lab/Alert'
import { selectAlertState } from '../../../redux/alert/selector'
import { alertCancel } from '../../../redux/alert/service'
import { bindActionCreators, Dispatch } from 'redux'
import { Box } from '@material-ui/core'

type Props = {
  alert: any
  alertCancel: typeof alertCancel
}

const mapStateToProps = (state: any) => {
  return {
    alert: selectAlertState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  alertCancel: bindActionCreators(alertCancel, dispatch)
})

class Alerts extends PureComponent<Props> {
  handleClose = (e: any) => {
    e.preventDefault()
    this.props.alertCancel()
  }

  render() {
    // const { type, token } = this.state
    const { alert } = this.props
    const type = this.props.alert.get('type')
    const message = this.props.alert.get('message')

    return (
      <Fragment>
        {type == 'none' || message == '' ? (
          <Box />
        ) : (
          <Box m={1}>
            <Alert
              variant="filled"
              severity={alert.get('type')}
              icon={false}
              onClose={(e) => this.handleClose(e)}
            >
              {alert.get('message')}
            </Alert>
          </Box>
        )}
      </Fragment>
    )
  }
}

const AlertsWraper = (props: any) => {
  // const router = useRouter()
  return <Alerts {...props} />
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertsWraper)
