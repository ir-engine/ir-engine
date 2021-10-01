import React, { useEffect } from 'react'
import { Paper, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import { fetchChargeBee } from '../../reducers/admin/Setting/chargebee/services'
import { selectAdminChargeBeeSettingState } from '../../reducers/admin/Setting/chargebee/selectors'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useStyles } from './styles'
import { useAuthState } from '../../../user/reducers/auth/AuthState'

const mapStateToProps = (state: any): any => {
  return {
    chargeBeeSettingState: selectAdminChargeBeeSettingState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchChargeBee: bindActionCreators(fetchChargeBee, dispatch)
})

interface Props {
  chargeBeeSettingState?: any
  fetchChargeBee?: any
}

const ChargeBee = (props: Props) => {
  const classes = useStyles()
  const { chargeBeeSettingState, fetchChargeBee } = props
  const [chargebee] = chargeBeeSettingState?.get('Chargebee').get('chargebee')

  const authState = useAuthState()
  const user = authState.user

  useEffect(() => {
    if (user?.id?.value != null && chargeBeeSettingState?.get('Chargebee').get('updateNeeded')) {
      fetchChargeBee()
    }
  }, [authState])

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          {' '}
          CHARGEBEE
        </Typography>
        <Paper component="div" className={classes.createInput}>
          <label>URL:</label>
          <InputBase
            value={chargebee?.url || ''}
            name="url"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
        <Paper component="div" className={classes.createInput}>
          <label>ApiKey:</label>
          <InputBase
            value={chargebee?.apikey || ''}
            name="apikey"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
      </form>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(ChargeBee)
