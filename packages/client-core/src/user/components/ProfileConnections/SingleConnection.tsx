import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '../../../store'
import { AlertAction } from '../../../common/state/AlertService'
import { DialogAction } from '../../../common/state/DialogService'
import MagicLinkEmail from '../Auth/MagicLinkEmail'
import PasswordLogin from '../Auth/PasswordLogin'
import { AuthService } from '../../state/AuthService'
import { ConnectionTexts } from './ConnectionTexts'
import { useTranslation } from 'react-i18next'
import styles from './ProfileConnections.module.scss'
import { useAuthState } from '../../state/AuthService'

interface Props {
  auth?: any
  classes?: any
  connectionType: 'facebook' | 'github' | 'google' | 'email' | 'sms' | 'password' | 'linkedin'
}

const SingleConnection = (props: Props): any => {
  const { auth, classes, connectionType } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const initialState = {
    identityProvider: IdentityProviderSeed,
    userId: ''
  }
  const [state, setState] = useState(initialState)

  useEffect(() => {
    const user = useAuthState().user.value
    if (!user) {
      return
    }

    setState({
      ...state,
      identityProvider: user.identityProviders.find((v) => v.type === connectionType) || IdentityProviderSeed
    })
  }, [])

  const disconnect = (): any => {
    const identityProvider = state.identityProvider
    const authIdentityProvider = props.auth.get('authUser').identityProvider
    if (authIdentityProvider.id === identityProvider.id) {
      dispatch(AlertAction.showAlert('error', t('user:profile.connections.ipError')))
      return
    }

    AuthService.removeConnection(identityProvider.id, state.userId)
  }

  const connect = (): any => {
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

const SingleConnectionWrapper = (props: Props): any => <SingleConnection {...props} />

export default SingleConnectionWrapper
