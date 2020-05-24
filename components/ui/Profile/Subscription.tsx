import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
// import {updateUserSettings} from '../../../redux/auth/service'
interface MProps {
  auth: any
}

const useStyles = makeStyles({
  root: {
    width: 300,
    padding: 20
  },
  subscriptionTitle: {
    display: 'flex',
    'justify-content': 'center',
    'font-size': '2em',
    'font-weight': 'bold'
  },
  subscriptionBody: {
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'justify-content': 'center'
  }
})

const UserSettings: React.FC<MProps> = (props: MProps) => {
  const classes = useStyles()
  const authUser = props.auth.get('user')

  // const handleSubmit = () => {

  // }
  return (
    <div>
      <div className={classes.subscriptionTitle}>Your Subscription</div>
      {authUser.subscription == null && <div className={classes.subscriptionBody}>Free Tier</div>}
      {authUser.subscription != null &&
        <div className={classes.subscriptionBody}>
          <div>Plan: {authUser.subscription.subscriptionType.name}</div>
          <div>Seats: {authUser.subscription.subscriptionType.seats}</div>
          <div>Unused Seats: {authUser.subscription.unusedSeats}</div>
          <div>Pending Seats: {authUser.subscription.pendingSeats}</div>
          <div>Filled Seats: {authUser.subscription.filledSeats}</div>
        </div>
      }
      <Button variant="contained" color="primary" href="/subscription/seats">
        Manage subscription seats
      </Button>
    </div>
  )
}

export default UserSettings
