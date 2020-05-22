
import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAuthState } from '../../../redux/auth/selector'
import {
  requestFriend,
  acceptFriend,
  declineFriend,
  blockUser,
  cancelBlock
} from '../../../redux/user/service'
import { Button } from '@material-ui/core'
import { User } from '../../../interfaces/User'

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
  data: User,

  requestFriend: typeof requestFriend,
  blockUser: typeof blockUser,
  acceptFriend: typeof acceptFriend,
  declineFriend: typeof declineFriend,
  cancelBlock: typeof cancelBlock
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestFriend: bindActionCreators(requestFriend, dispatch),
  blockUser: bindActionCreators(blockUser, dispatch),
  acceptFriend: bindActionCreators(acceptFriend, dispatch),
  declineFriend: bindActionCreators(declineFriend, dispatch),
  cancelBlock: bindActionCreators(cancelBlock, dispatch)
})

class UserItem extends React.Component<Props> {
  state = {
    userId: '',
    relatedUserId: ''
  }

  componentDidMount() {
    const user = this.props.auth.get('user') as User
    this.setState({
      userId: user?.id,
      relatedUserId: this.props.data.id
    })
  }

  // close a friend
  cancelFriend = () => {
    this.props.declineFriend(this.state.userId, this.state.relatedUserId)
  }

  // request to add a friend
  request = () => {
    this.props.requestFriend(this.state.userId, this.state.relatedUserId)
  }

  // accept the friend request
  accept = () => {
    this.props.acceptFriend(this.state.userId, this.state.relatedUserId)
  }

  // decline the friend request
  decline = () => {
    this.props.declineFriend(this.state.userId, this.state.relatedUserId)
  }

  // block a user
  block = () => {
    this.props.blockUser(this.state.userId, this.state.relatedUserId)
  }

  cancelBlock = () => {
    this.props.cancelBlock(this.state.userId, this.state.relatedUserId)
  }

  render() {
    const { classes, data } = this.props
    return (
      <div className={classes.root}>
        <Box display="flex" p={1}>
          <Box p={1} display="flex">
            <Avatar variant="rounded" src="" alt="avatar"/>
          </Box>
          <Box p={1} flexGrow={1}>
            <Typography variant="h6">
              {data.name}
            </Typography>
          </Box>
          <Box p={1} display="flex">
            {data.relationType === 'friend' && data.inverseRelationType === 'friend' &&
              <Grid container direction="row">
                <Button variant="contained" color="secondary" onClick={this.cancelFriend}>Cancel Friend</Button>
              </Grid>
            }
            {data.relationType === 'requested' && data.inverseRelationType === 'friend' &&
              <Grid container direction="row">
                <Button variant="contained" color="primary" onClick={this.accept}>Accept</Button>
                <Button variant="contained" color="secondary" onClick={this.decline}>Decline</Button>
              </Grid>
            }
            {data.relationType === 'friend' && data.inverseRelationType === 'requested' &&
              <Grid container direction="row">
                <Typography variant="h6">
                  Pending
                </Typography>
              </Grid>
            }
            {data.relationType === 'blocking' &&
              <Grid container direction="row">
                <Grid xs item>
                  <Button variant="contained" color="primary" onClick={this.cancelBlock}>Cancel Block</Button>
                </Grid>
              </Grid>
            }
            {data.relationType === 'blocked' &&
              <Grid container direction="row">
                <Typography variant="h6">
                  Blocked
                </Typography>
              </Grid>
            }
            {(!data.relationType) &&
              <Grid container direction="row">
                <Button variant="contained" color="primary" onClick={this.request}>Request a friend</Button>
                <Button variant="contained" color="secondary" onClick={this.block}>Block</Button>
              </Grid>
            }
          </Box>
        </Box>
      </div>
    )
  }
}

function UserItemWrapper(props: any) {
  const classes = useStyles()

  return (
    <UserItem {...props} classes={classes}/>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserItemWrapper)
