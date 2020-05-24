import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../redux/auth/selector'
import { User } from '../../../interfaces/User'
import { Seat } from '../../../interfaces/Seat'
import { TextField, Button } from '@material-ui/core'
import SeatItem from './SeatItem'
import { Dispatch, bindActionCreators } from 'redux'
import { selectSeatState } from '../../../redux/seats/selector'
import {
  inviteUser,
  getSeats
} from '../../../redux/seats/service'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      padding: '10px'
    },
    section1: {
      padding: theme.spacing(3)
    },
    inviteBox: {
      'margin-top': '10px',
      display: 'flex',
      'align-items': 'center'
    },
    inputBox: {
      'margin-right': '20px'
    }
  })
)

interface Props {
  seatState: any
  authState: any
  classes: any,
  getSeats: typeof getSeats,
  inviteUser: typeof inviteUser
}

const mapStateToProps = (state: any) => {
  return {
    seatState: selectSeatState(state),
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getSeats: bindActionCreators(getSeats, dispatch),
  inviteUser: bindActionCreators(inviteUser, dispatch)
})

class SeatList extends React.Component<Props> {
  state = {
    userId: undefined,
    updateNeeded: false,
    inviteField: ''
  }

  inviteUser = () => {
    this.props.inviteUser(this.state.inviteField, this.props.authState.get('user').subscription.id)
    this.setState({
      inviteField: ''
    })
  }

  updateField = (e: any) => {
    this.setState({
      inviteField: e.target.value
    })
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: any) {
    const { authState, seatState } = nextProps
    const user = authState.get('user') as User
    if (user.subscription && seatState.get('updateNeeded') === true) {
      this.props.getSeats()
    }
  }

  render() {
    const { classes, seatState } = this.props
    const pending = seatState.get('seats').filter((seat: Seat) => seat.seatStatus === 'pending')
    const filled = seatState.get('seats').filter((seat: Seat) => seat.seatStatus === 'filled')

    return (
      <div className={classes.root}>
        <div className={classes.section1}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">
                Subscription Seats
              </Typography>
            </Grid>
          </Grid>
        </div>

        <Divider variant="middle" />
        <Grid container>
          <Grid item xs
            className={classes.inviteBox}
          >
            <TextField
              label="Invite users by email"
              type="search"
              variant="outlined"
              className={classes.inputBox}
              value={this.state.inviteField}
              onChange={(e) => this.updateField(e)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={this.inviteUser}
            >
              Invite User
            </Button>
          </Grid>
        </Grid>

        { pending && pending.length > 0 &&
        pending.map((seat) => {
          return <SeatItem key={'pending_' + seat.id} seat={seat}/>
        })
        }
        { filled && filled.length > 0 &&
        filled.map((seat) => {
          return <SeatItem key={'requested_' + seat.id} seat={seat}/>
        })
        }
      </div>
    )
  }
}

function MyFriendsWrapper(props: any) {
  const classes = useStyles()

  return (
    <SeatList {...props} classes={classes}/>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyFriendsWrapper)
