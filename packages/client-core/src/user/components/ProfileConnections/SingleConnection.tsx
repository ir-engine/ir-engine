import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { AlertAction } from '../../../common/services/AlertService'
import { DialogAction } from '../../../common/services/DialogService'
import { useDispatch } from '../../../store'
import { AuthService } from '../../services/AuthService'
import { useAuthState } from '../../services/AuthService'
import MagicLinkEmail from '../Auth/MagicLinkEmail'
import PasswordLogin from '../Auth/PasswordLogin'
import { ConnectionTexts } from './ConnectionTexts'
import styles from './index.module.scss'

interface Props {
  auth?: any
  //classes?: any
  connectionType: 'facebook' | 'github' | 'google' | 'email' | 'sms' | 'password' | 'linkedin'
}

const SingleConnection = (props: Props): JSX.Element => {
  const { connectionType } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const authState = useAuthState()
  const user = authState.user.value

  const initialState = {
    identityProvider: IdentityProviderSeed,
    userId: ''
  }
  const [state, setState] = useState(initialState)

  useEffect(() => {
    if (!user) {
      return
    }

    setState({
      ...state,
      identityProvider: user.identityProviders?.find((v) => v.type === connectionType) || IdentityProviderSeed
    })
  }, [])

  const disconnect = (): void => {
    const identityProvider = state.identityProvider
    const authIdentityProvider = authState.identityProvider.value
    if (authIdentityProvider.id === identityProvider.id) {
      dispatch(AlertAction.showAlert('error', t('user:profile.connections.ipError')))
      return
    }

    AuthService.removeConnection(identityProvider.id, state.userId)
  }

  const connect = (): void => {
    const { userId } = state

    switch (connectionType) {
      case 'facebook':
      case 'google':
      case 'github':
        AuthService.addConnectionByOauth(connectionType, userId)
        break
      case 'email':
        dispatch(
          DialogAction.dialogShow({
            children: <MagicLinkEmail type="email" isAddConnection={true} />
          })
        )
        break
      case 'sms':
        dispatch(
          DialogAction.dialogShow({
            children: <MagicLinkEmail type="sms" isAddConnection={true} />
          })
        )
        break
      case 'password':
        dispatch(
          DialogAction.dialogShow({
            children: <PasswordLogin isAddConnection={true} />
          })
        )
        break
      case 'linkedin':
        AuthService.addConnectionByOauth(connectionType, userId)
        break
    }
  }

  const identityProvider = state.identityProvider
  let texts
  let actionBlock
  if (identityProvider?.id) {
    texts = ConnectionTexts[connectionType].connected

    actionBlock = (
      <Box display="flex">
        <Box p={1}>
          <a href="#" onClick={disconnect} className={styles.button}>
            <Typography variant="h6">{identityProvider.token}</Typography>
            <Typography color="textSecondary" variant="body2">
              ({t('user:profile.connections.disconnect')})
            </Typography>
          </a>
        </Box>
        <Box p={1}>
          <Avatar variant="rounded" src="" alt="avatar" />
        </Box>
      </Box>
    )
  } else {
    texts = ConnectionTexts[connectionType].notConnected

    actionBlock = (
      <Box display="flex">
        <Box p={1}>
          <a href="#" onClick={connect} className={styles.button}>
            {t('user:profile.connections.connect')}
          </a>
        </Box>
      </Box>
    )
  }

  return (
    <div className={styles.root}>
      <Box display="flex" p={1}>
        <Box p={1} flexGrow={1}>
          <Grid container direction="column">
            <Typography gutterBottom variant="h5">
              {texts.header}
            </Typography>

            {texts.descr.map((descr, index) => {
              return (
                <Typography key={index} color="textSecondary" variant="body2">
                  {descr}
                </Typography>
              )
            })}
          </Grid>
        </Box>

        {actionBlock}
      </Box>
    </div>
  )
}

const SingleConnectionWrapper = (props: Props): JSX.Element => <SingleConnection {...props} />

export default SingleConnectionWrapper
