
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
  cancelInvitation,
  removeSeat
} from '../../../redux/seats/service'
import { Button } from '@material-ui/core'
import { User } from '../../../interfaces/User'
import { Seat, SeatStatus } from '../../../interfaces/Seat'

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
  seat: Seat,

  cancelInvitation: typeof cancelInvitation,
  removeSeat: typeof removeSeat
}

const mapStateToProps = (state: any) => {
  return {
    auth: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancelInvitation: bindActionCreators(cancelInvitation, dispatch),
  removeSeat: bindActionCreators(removeSeat, dispatch)
})

class SeatItem extends React.Component<Props> {
  state = {
    userId: '',
    seat: {
      id: '',
      userId: '',
      seatStatus: 'pending' as SeatStatus,
      subscriptionId: ''
    }
  }

  componentDidMount() {
    const user = this.props.auth.get('user') as User
    this.setState({
      userId: user?.id,
      seat: this.props.seat
    })
  }

  // close a friend
  cancelInvitation = () => {
    this.props.cancelInvitation(this.state.seat)
  }

  revokeSeat = () => {
    this.props.removeSeat(this.props.seat)
  }

  render() {
    const { classes, seat } = this.props
    return (
      <div className={classes.root}>
        <Box display="flex" p={1}>
          <Box p={1} display="flex">
            <Avatar variant="rounded" src="" alt="avatar"/>
          </Box>
          <Box p={1} flexGrow={1}>
            <Typography variant="h6">
              {seat.user.name}
            </Typography>
            <Typography variant="h6">
              {seat.user.email}
            </Typography>
          </Box>
          <Box p={1} display="flex">
            {seat.seatStatus === 'pending' &&
            <Grid container direction="row">
              <Button variant="contained" color="secondary" onClick={this.cancelInvitation}>Cancel Invitation</Button>
            </Grid>
            }
            {seat.seatStatus === 'filled' && seat.userId !== this.state.userId &&
            <Grid container direction="row">
              <Button variant="contained" color="primary" onClick={this.revokeSeat}>Revoke this user&apos;s seat</Button>
            </Grid>
            }
            {seat.seatStatus === 'filled' && seat.userId === this.state.userId &&
            <Grid container direction="row">
              <Typography variant="h6">
                This is you. You cannot revoke your own seat.
              </Typography>
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
    <SeatItem {...props} classes={classes}/>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserItemWrapper)
