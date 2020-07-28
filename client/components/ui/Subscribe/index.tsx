import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Dispatch, bindActionCreators } from 'redux'
import { useRouter } from 'next/router'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Grid, Box, Divider, Typography, TextField, Button } from '@material-ui/core'
import { client } from '../../../redux/feathers'
import { selectAuthState } from '../../../redux/auth/selector'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
// import moment from 'moment'
import './style.scss'
import {
  getSubscriptionDetail
} from '../../../redux/subscription/service'

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
    firstRow: {
      padding: '8px'
    },
    row: {
      padding: '8px',
      paddingTop: 0
    },
    content: {
      'margin-top': '10px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'space-between',
    },
    header: {
      display: 'flex',
      'justify-content': 'space-between'
    }
  })
)

interface Props {
  authState?: any
  classes?: any
  getSubscriptionDetail?: typeof getSubscriptionDetail
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getSubscriptionDetail: bindActionCreators(getSubscriptionDetail, dispatch),
})

const SubscribeStatus = (props: Props): any => {
  const { classes, authState } = props
  const initialState = {
    userId: undefined,
    updateNeeded: false,
    nextBillingDate: undefined
  }
  const [state, setState] = useState(initialState)

  const router = useRouter()
  const subscription = authState.get('user').subscription

  // eslint-disable-next-line camelcase
  useEffect(() => {
    console.log(subscription)
    if (subscription != null) {
      if (subscription) client.service('subscription').get(subscription.id).then((res: any) => {
        console.log('subscription------', res)
        setState({
          ...state,
          nextBillingDate: res.next_billing_at
        })
      })
        .catch((err: any) => {
          console.log(err)
        })
    }
  }, [authState.get('user').subscription])

  const convertTimeStamp2Date = (timestamp: number): any => {
    let newDate = new Date(timestamp * 1000)
    // return date.format('MMM D, YYYY');
    return newDate
  }

  return (
    <div className={classes.root}>
      <div className={classes.section1}>
        <Grid container alignItems="center">
          <Grid item xs className={classes.header}>
            <Typography variant="h4">
              Subscription
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.push('/')}>
              <ArrowBackIcon />
            </Button>
          </Grid>
        </Grid>
      </div>

      <Divider variant="middle" />
      {subscription != null && <Grid container>
        <Grid item
          xs={12}
          className={classes.firstRow}
        >
          <Box p={1} display="flex" className={classes.content}>
            <Typography variant="h6">
              {subscription ? subscription.subscriptionType.name : ''}
            </Typography>
            <Button
              variant="contained"
              color="primary"
            // onClick={() => inviteUser()}
            >
              Change
          </Button>
          </Box>

        </Grid>
        <Grid item
          xs={12}
          className={classes.row}
        >
          <Box p={1} display="flex" className={classes.content}>
            <Typography variant="h6">
              {subscription ? `Next Payment due $${subscription.subscriptionType.amount} on ${state.nextBillingDate ?? convertTimeStamp2Date(state.nextBillingDate)}` : ''}
            </Typography>
            <Button
              color="secondary"
            // onClick={() => inviteUser()}
            >
              Cancel Subscription
          </Button>
          </Box>

        </Grid>
      </Grid>
      }

    </div>
  )
}

const SubscribeStatusWrapper = (props: Props): any => {
  const classes = useStyles()
  return (
    <SubscribeStatus {...props} classes={classes} />
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubscribeStatusWrapper)
