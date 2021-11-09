import React, { useEffect } from 'react'
import { Paper, Typography } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import { useStyles } from './styles'
import Switch from '@mui/material/Switch'
import { useAdminRedisSettingState } from '../../services/Setting/AdminRedisSettingService'
import { AdminRedisSettingService } from '../../services/Setting/AdminRedisSettingService'

import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'

interface Props {
  redisSettingState?: any
}

const Redis = (props: Props) => {
  const classes = useStyles()
  const redisSettingState = useAdminRedisSettingState()
  const [redisSetting] = redisSettingState?.redisSettings?.value || []
  const dispatch = useDispatch()
  const [enabled, setEnabled] = React.useState({
    checkedA: true,
    checkedB: true
  })
  const authState = useAuthState()
  const user = authState.user
  useEffect(() => {
    if (user?.id?.value != null && redisSettingState?.updateNeeded?.value) {
      AdminRedisSettingService.fetchRedisSetting()
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

export default Redis
