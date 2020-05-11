
import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
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
import { User } from '../../../interfaces/User'
import { IdentityProviderSeed } from '../../../interfaces/IdentityProvider'
import { showAlert } from '../../../redux/alert/actions'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper
    },
    button: {
      '&:hover': {
        textDecoration: 'none'
      },

      color: 'black',
      fontSize: '20px'
    }
  })
)

interface Props {
  auth: any,
  classes: any,
  connectionType: 'facebook' | 'github' | 'google' | 'email' | 'sms' | 'password',

  showDialog: typeof showDialog,
  addConnectionByOauth: typeof addConnectionByOauth,
  createMagicLink: typeof createMagicLink,
  loginUserByPassword: typeof loginUserByPassword,
  addConnectionByPassword: typeof addConnectionByPassword,
  removeConnection: typeof removeConnection,
  showAlert: typeof showAlert
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showDialog: bindActionCreators(showDialog, dispatch),
  addConnectionByOauth: bindActionCreators(addConnectionByOauth, dispatch),
  createMagicLink: bindActionCreators(createMagicLink, dispatch),
  loginUserByPassword: bindActionCreators(loginUserByPassword, dispatch),
  addConnectionByPassword: bindActionCreators(addConnectionByPassword, dispatch),
  removeConnection: bindActionCreators(removeConnection, dispatch),
  showAlert: bindActionCreators(showAlert, dispatch)
})

class SingleConnection extends React.Component<Props> {
  state = {
    identityProvider: IdentityProviderSeed,
    userId: ''
  }

  componentDidMount() {
    const { auth, connectionType } = this.props
    const user = auth.get('user') as User
    if (!user) {
      return
    }

    const identityProvider = user.identityProviders.find((v) => v.type === connectionType)
    this.setState({
      identityProvider
    })
  }

  disconnect = () => {
    const identityProvider = this.state.identityProvider
    const authIdentityProvider = this.props.auth.get('authUser').identityProvider
    if (authIdentityProvider.id === identityProvider.id) {
      this.props.showAlert('error', 'Can not remove active Identity Provider')
      return
    }

    this.props.removeConnection(identityProvider.id, this.state.userId)
  }

  connect = () => {
    const { connectionType } = this.props
    const { userId } = this.state

    switch (connectionType) {
      case 'facebook':
      case 'google':
      case 'github':
        this.props.addConnectionByOauth(connectionType, userId)
        break
      case 'email':
        this.props.showDialog({
          children: (
            <MagicLinkEmail type="email" isAddConnection={true}/>
          )
        })
        break
      case 'sms':
        this.props.showDialog({
          children: (
            <MagicLinkEmail type="sms" isAddConnection={true}/>
          )
        })
        break
      case 'password':
        this.props.showDialog({
          children: (
            <PasswordLogin isAddConnection={true}/>
          )
        })
        break
    }
  }

  render() {
    const { classes, connectionType } = this.props
    const identityProvider = this.state.identityProvider
    let texts
    let actionBlock
    if (identityProvider && identityProvider.id) {
      texts = ConnectionTexts[connectionType].connected

      actionBlock = (
        <Box display="flex">
          <Box p={1}>
            <Link href="#" onClick={this.disconnect} className={classes.button}>
              <Typography variant="h6">
                {identityProvider.token}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                (disconnect)
              </Typography>
            </Link>
          </Box>
          <Box p={1}>
            <Avatar variant="rounded" src="" alt="avatar"/>
          </Box>
        </Box>
      )
    } else {
      texts = ConnectionTexts[connectionType].not_connected

      actionBlock = (
        <Box display="flex">
          <Box p={1}>
            <Link href="#" onClick={this.connect} className={classes.button}>
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
}

function SingleConnectionWrapper(props: any) {
  const classes = useStyles()

  return (
    <SingleConnection {...props} classes={classes}/>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleConnectionWrapper)
