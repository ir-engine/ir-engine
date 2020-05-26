import { Component } from 'react'
import Button from '@material-ui/core/Button'
import SignIn from '../Auth/Login'
import { logoutUser } from '../../../redux/auth/service'
import { selectAuthState } from '../../../redux/auth/selector'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { showDialog } from '../../../redux/dialog/service'
import Dropdown from '../Profile/ProfileDropdown'
import { User } from '../../../interfaces/User'
import './style.scss'

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logoutUser: bindActionCreators(logoutUser, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch)
})

type Props = {
  auth: any
  logoutUser: typeof logoutUser
  showDialog: typeof showDialog
}

class NavUserBadge extends Component<Props> {
  handleLogout() {
    this.props.logoutUser()
  }

  render() {
    const styles = {
      loginButton: {
        color: 'white'
      },
      logoutButton: {
        color: 'white'
      }
    }

    const isLoggedIn = this.props.auth.get('isLoggedIn')
    const user = this.props.auth.get('user') as User
    // const userName = user && user.name

    return (
      <div className="userWidget">
        {isLoggedIn && (
          <div className="flex">
            <Dropdown
              avatarUrl={user && user.avatarUrl}
              auth={this.props.auth}
              logoutUser={this.props.logoutUser} />
          </div>
        )}
        {!isLoggedIn && (
          <Button
            style={styles.loginButton}
            onClick={() =>
              this.props.showDialog({
                children: <SignIn />
              })
            }
          >
            Log In
          </Button>
        )}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavUserBadge)
