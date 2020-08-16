import React, { useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAuthState } from '../../../redux/auth/selector'
import { showDialog } from '../../../redux/dialog/service'
import { ConnectionTexts } from './ConnectionTexts'
import {
  createMagicLink,
  loginUserByPassword,
  addConnectionByOauth,
  addConnectionByPassword,
  removeConnection
} from '../../../redux/auth/service'
import MagicLinkEmail from '../Auth/MagicLinkEmail'
import PasswordLogin from '../Auth/PasswordLogin'
import { User } from '@xr3ngine/common'
import { IdentityProviderSeed } from '../../../../common/interfaces/IdentityProvider'
import { showAlert } from '../../../redux/alert/actions'
import './style.scss'

interface Props {
  auth?: any
  classes?: any
  connectionType?:
  | 'facebook'
  | 'github'
  | 'google'
  | 'email'
  | 'sms'
  | 'password'

  showDialog?: typeof showDialog
  addConnectionByOauth?: typeof addConnectionByOauth
  createMagicLink?: typeof createMagicLink
  loginUserByPassword?: typeof loginUserByPassword
  addConnectionByPassword?: typeof addConnectionByPassword
  removeConnection?: typeof removeConnection
  showAlert?: typeof showAlert
}

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  showDialog: bindActionCreators(showDialog, dispatch),
  addConnectionByOauth: bindActionCreators(addConnectionByOauth, dispatch),
  createMagicLink: bindActionCreators(createMagicLink, dispatch),
  loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch),
  addConnectionByPassword: bindActionCreators(
    addConnectionByPassword,
    dispatch
  ),
  removeConnection: bindActionCreators(removeConnection, dispatch),
  showAlert: bindActionCreators(showAlert, dispatch)
})

const SingleConnection = (props: Props): any => {
  const {
    addConnectionByOauth,
    auth,
    classes,
    connectionType,
    removeConnection,
    showAlert,
    showDialog
  } = props

  const initialState = {
    identityProvider: IdentityProviderSeed,
    userId: ''
  }
  const [state, setState] = useState(initialState)

  useEffect(() => {
    const user = auth.get('user') as User
    if (!user) {
      return
    }

    setState({
      ...state,
      identityProvider: user.identityProviders.find(
        (v) => v.type === connectionType
      )
    })
  }, [])

  const disconnect = (): any => {
    const identityProvider = state.identityProvider
    const authIdentityProvider = props.auth.get('authUser').identityProvider
    if (authIdentityProvider.id === identityProvider.id) {
      showAlert('error', 'Can not remove active Identity Provider')
      return
    }

    removeConnection(identityProvider.id, state.userId)
  }

  const connect = (): any => {
    const { userId } = state

    switch (connectionType) {
      case 'facebook':
      case 'google':
      case 'github':
        addConnectionByOauth(connectionType, userId)
        break
      case 'email':
        showDialog({
          children: <MagicLinkEmail type="email" isAddConnection={true} />
        })
        break
      case 'sms':
        showDialog({
          children: <MagicLinkEmail type="sms" isAddConnection={true} />
        })
        break
      case 'password':
        showDialog({
          children: <PasswordLogin isAddConnection={true} />
        })
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
          <Link href="#" onClick={disconnect} className={classes.button}>
            <Typography variant="h6">{identityProvider.token}</Typography>
            <Typography color="textSecondary" variant="body2">
              (disconnect)
            </Typography>
          </Link>
        </Box>
        <Box p={1}>
          <Avatar variant="rounded" src="" alt="avatar" />
        </Box>
      </Box>
    )
  } else {
    texts = ConnectionTexts[connectionType].not_connected

    actionBlock = (
      <Box display="flex">
        <Box p={1}>
          <Link href="#" onClick={connect} className={classes.button}>
            Connect
          </Link>
        </Box>
      </Box>
    )
  }

  return (
    <div className={classes.root}>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleConnectionWrapper)
