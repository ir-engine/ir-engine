import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Grid } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { Config, validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
import * as polyfill from 'credential-handler-polyfill'
import styles from './AdminLogin.module.scss'
import { useTranslation } from 'react-i18next'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'

interface Props {
  changeActiveMenu?: any
  setProfileMenuOpen?: any
  classes?: any

  hideLogin?: any
}

const AdminLogin = (props: Props): any => {
  const { changeActiveMenu, setProfileMenuOpen, hideLogin } = props
  const { t } = useTranslation()

  const dispatch = useDispatch()
  const selfUser = useAuthState().user

  const [username, setUsername] = useState(selfUser?.name.value)
  const [emailPhone, setEmailPhone] = useState('')
  const [error, setError] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const { classes } = props

  let type = ''

  const loadCredentialHandler = async () => {
    try {
      const mediator = `${Config.publicRuntimeConfig.mediatorServer}/mediator?origin=${encodeURIComponent(
        window.location.origin
      )}`

      await polyfill.loadOnce(mediator)
      console.log('Ready to work with credentials!')
    } catch (e) {
      console.error('Error loading polyfill:', e)
    }
  }

  useEffect(() => {
    loadCredentialHandler()
  }, []) // Only run once

  useEffect(() => {
    selfUser && setUsername(selfUser.name.value)
  }, [selfUser.name.value])

  const handleInputChange = (e) => setEmailPhone(e.target.value)

  const validate = () => {
    if (emailPhone === '') return false
    if (validateEmail(emailPhone.trim())) type = 'email'
    else if (validatePhoneNumber(emailPhone.trim())) type = 'sms'
    else {
      setError(true)
      return false
    }

    setError(false)
    return true
  }

  const handleSubmit = (e: any): any => {
    e.preventDefault()
    if (!validate()) return
    if (type === 'email') AuthService.addConnectionByEmail(emailPhone, selfUser?.id?.value)
    else if (type === 'sms') AuthService.addConnectionBySms(emailPhone, selfUser?.id?.value)
    return
  }

  return (
    <div className={styles.container}>
      <Grid container className={styles.gridContainer}>
        <Grid item>
          <form onSubmit={handleSubmit} style={{ display: 'grid' }}>
            <TextField
              className={styles.emailField}
              size="small"
              placeholder="Email"
              variant="outlined"
              onChange={handleInputChange}
              onBlur={validate}
              error={error}
              helperText={error ? t('user:usermenu.profile.phoneEmailError') : null}
            />
            <Button className={styles.sendButton} onClick={handleSubmit}>
              Send Magic Link
            </Button>
          </form>
        </Grid>
      </Grid>
    </div>
  )
}

export default AdminLogin
