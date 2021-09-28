import React, { useEffect } from 'react'
import { Paper, Typography } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import { useStyles } from './styles'
import Switch from '@material-ui/core/Switch'
import { selectAdminRedisSettingState } from '../../reducers/admin/Setting/redis/selector'
import { fetchRedisSetting } from '../../reducers/admin/Setting/redis/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useAuthState } from '../../../user/reducers/auth/AuthState'

const mapStateToProps = (state: any): any => {
  return {
    redisSettingState: selectAdminRedisSettingState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchRedisSetting: bindActionCreators(fetchRedisSetting, dispatch)
})
interface Props {
  redisSettingState?: any
  fetchRedisSetting?: any
}

const Redis = (props: Props) => {
  const classes = useStyles()
  const { redisSettingState, fetchRedisSetting } = props
  const [redisSetting] = redisSettingState?.get('redisSettings').get('redisSettings')

  const [enabled, setEnabled] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const authState = useAuthState()
  const user = authState.user
  useEffect(() => {
    if (user?.id?.value != null && redisSettingState?.get('redisSettings').get('updateNeeded')) {
      fetchRedisSetting()
    }
  }, [authState])

  const handleEnable = (event) => {
    setEnabled({ ...enabled, [event.target.name]: event.target.checked })
  }

  return (
    <div>
      <form>
        <Typography component="h1" className={classes.settingsHeading}>
          REDIS
        </Typography>
        <label>Enabled</label>
        <Paper component="div" className={classes.createInput}>
          <Switch
            disabled
            checked={enabled.checkedB}
            onChange={handleEnable}
            color="primary"
            name="checkedB"
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        </Paper>
        <br />
        <Paper component="div" className={classes.createInput}>
          <label>Address:</label>
          <InputBase
            value={redisSetting?.address || ''}
            name="address"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
        <Paper component="div" className={classes.createInput}>
          <label>Port:</label>
          <InputBase
            value={redisSetting?.port || ''}
            name="port"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
        <Paper component="div" className={classes.createInput}>
          <label>Password:</label>
          <InputBase
            value={redisSetting?.password || ''}
            name="password"
            className={classes.input}
            disabled
            style={{ color: '#fff' }}
          />
        </Paper>
      </form>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Redis)
