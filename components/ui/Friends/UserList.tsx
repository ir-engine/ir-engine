
import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'
import { selectUserState } from '../../../redux/user/selector'
import { selectAuthState } from '../../../redux/auth/selector'
import { User } from '../../../interfaces/User'
import UserItem from './UserItem'
import {
  getUsers
} from '../../../redux/user/service'
import { TextField, InputAdornment } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { debounce } from 'lodash'

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
  getUsers: typeof getUsers
}

const mapStateToProps = (state: any) => {
  return {
    userState: selectUserState(state),
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getUsers: bindActionCreators(getUsers, dispatch)
})

class UserList extends React.Component<Props> {
  state = {
    userId: undefined,
    search: ''
  }

  onSearch = (e: any) => {
    this.setState({
      search: e.target.value
    })

    this.debouncedSearch()
  }

  debouncedSearch = debounce(() => {
    this.props.getUsers(this.state.userId, this.state.search)
  }, 500);

  loadUsers(userId: string, forceUpdate: boolean) {
    if (userId && (forceUpdate || (userId !== this.state.userId && userId && userId !== ''))) {
      this.props.getUsers(userId, '')

      this.setState({
        userId
      })
    }
  }

  componentDidMount() {
    const { authState } = this.props
    const user = authState.get('user') as User
    this.loadUsers(user.id, false)
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: any) {
    const { authState, userState } = nextProps
    const user = authState.get('user') as User
    const updateNeeded = userState.get('updateNeeded')

    this.loadUsers(user.id, updateNeeded)
  }

  render() {
    const { classes, userState } = this.props
    const users = userState.get('users')

    return (
      <div className={classes.root}>
        <div className={classes.section1}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">
                Users
              </Typography>
            </Grid>
          </Grid>
        </div>

        <Divider variant="middle" />
        <TextField
          label="Search"
          type="search"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          onChange={this.onSearch}
        />

        { users && users.length > 0 &&
          users.map((user: User) => {
            return <UserItem key={'user_' + user.id} data={user}/>
          })
        }

        { (!users || users.length === 0) &&
         <Grid container alignItems="center">
           <Grid item xs>
             <Typography variant="body2">
              There is search users.
             </Typography>
           </Grid>
         </Grid>
        }
      </div>
    )
  }
}

function UserListWrapper(props: any) {
  const classes = useStyles()

  return (
    <UserList {...props} classes={classes}/>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserListWrapper)
