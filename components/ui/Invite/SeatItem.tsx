
import React, { useState } from 'react'
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

const SeatItem = (props: Props) => {
  const initialState = {
    userId: '',
    seat: {
      id: '',
      userId: '',
      seatStatus: 'pending' as SeatStatus,
      subscriptionId: ''
    }
  }

  const [state, setState] = useState(initialState)

  const user = props.auth.get('user') as User
  setState({
    ...state,
    userId: user?.id,
    seat: props.seat
  })
  const { classes, seat } = props

  // close a friend
  const cancelInvitation = () => {
    props.cancelInvitation(state.seat)
  }

  const revokeSeat = () => {
    props.removeSeat(props.seat)
  }

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
            <Button variant="contained" color="secondary" onClick={cancelInvitation}>Cancel Invitation</Button>
          </Grid>
          }
          {seat.seatStatus === 'filled' && seat.userId !== state.userId &&
          <Grid container direction="row">
            <Button variant="contained" color="primary" onClick={revokeSeat}>Revoke this user&apos;s seat</Button>
          </Grid>
          }
          {seat.seatStatus === 'filled' && seat.userId === state.userId &&
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
