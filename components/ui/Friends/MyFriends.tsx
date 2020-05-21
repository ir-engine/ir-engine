
import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import { selectUserState } from '../../../redux/user/selector'
import { selectAuthState } from '../../../redux/auth/selector'
import { User } from '../../../interfaces/User'
import { Button } from '@material-ui/core'
import UserItem from './UserItem'
import { Relationship } from '../../../interfaces/Relationship'
import { Dispatch, bindActionCreators } from 'redux'
import { getUserRelationship } from '../../../redux/user/service'
import NextLink from 'next/link'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      padding: '10px'
    },
    section1: {
      padding: theme.spacing(3)
    }
  })
)

interface Props {
  userState: any
  authState: any
  classes: any
  getUserRelationship: typeof getUserRelationship
}

const mapStateToProps = (state: any) => {
  return {
    userState: selectUserState(state),
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getUserRelationship: bindActionCreators(getUserRelationship, dispatch)
})

class MyFriends extends React.Component<Props> {
  state = {
    userId: undefined,
    updateNeeded: false
  }

  loadUserRelationship(userId: string, forceUpdate: boolean) {
    if (userId && (forceUpdate || (userId !== this.state.userId && userId && userId !== ''))) {
      this.props.getUserRelationship(userId)

      this.setState({
        userId
      })
    }
  }

  componentDidMount() {
    const { authState } = this.props
    const user = authState.get('user') as User
    this.loadUserRelationship(user.id, false)
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: any) {
    const { authState, userState } = nextProps
    const user = authState.get('user') as User
    const updateNeeded = userState.get('updateNeeded')

    this.loadUserRelationship(user.id, updateNeeded)
  }

  render() {
    const { classes, userState } = this.props
    const relationship = userState.get('relationship') as Relationship
    const friends = relationship.friend
    const requested = relationship.requested
    const friendsCount = friends?.length + requested?.length

    return (
      <div className={classes.root}>
        <div className={classes.section1}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">
                Friends
              </Typography>
            </Grid>
          </Grid>
        </div>

        <Divider variant="middle" />
        <Grid container>
          <Grid item xs>
            <NextLink href={'/friends/find'}>
              <Button variant="contained" color="primary">+ Add a Friend</Button>
            </NextLink>

          </Grid>
        </Grid>

        { friends && friends.length > 0 &&
          friends.map((friend) => {
            return <UserItem key={'friend_' + friend.id} data={friend}/>
          })
        }
        { requested && requested.length > 0 &&
          requested.map((friend) => {
            return <UserItem key={'requested_' + friend.id} data={friend}/>
          })
        }

        { (friendsCount === 0) &&
         <Grid container alignItems="center">
           <Grid item xs>
             <Typography variant="body2">
              Add some friends!
             </Typography>
           </Grid>
         </Grid>
        }
      </div>
    )
  }
}

function MyFriendsWrapper(props: any) {
  const classes = useStyles()

  return (
    <MyFriends {...props} classes={classes}/>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyFriendsWrapper)
