import React from 'react'

import { Box, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  container: {
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    [theme.breakpoints.down('900')]: {
      width: '50%',
      margin: '0 auto'
    },
    [theme.breakpoints.down('350')]: {
      width: '70%',
      margin: '0 auto'
    }
  },

  connectBtns: {
    color: '#fff',
    background: '#7dc273',
    borderRadius: 15,
    border: 'none',
    fontSize: 20,
    padding: '20px 10px',
    boxShadow: '0px 2px 3px #000',
    margin: 20,
    textTransform: 'uppercase',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('1520')]: {
      fontSize: 18
    },
    [theme.breakpoints.down('1350')]: {
      fontSize: 15
    },
    [theme.breakpoints.down('1120')]: {
      fontSize: 13
    },
    [theme.breakpoints.down('980')]: {
      fontSize: 12,
      marginBottom: '3em'
    },
    [theme.breakpoints.down('900')]: {
      justifyContent: 'space-evenly',
      margin: 20
    }
  },

  walletImageMeta: {
    marginRight: 20,
    width: 70,
    height: 70,
    [theme.breakpoints.down('1520')]: {
      width: 60,
      height: 60
    },
    [theme.breakpoints.down('1350')]: {
      width: 50,
      height: 50
    },
    [theme.breakpoints.down('1120')]: {
      width: 30,
      height: 30
    },
    [theme.breakpoints.down('980')]: {
      width: 25,
      height: 25
    },
    [theme.breakpoints.down('900')]: {
      width: 50,
      height: 50,
      marginRight: 0
    }
  },

  walletImagesWalet: {
    marginRight: 20,
    width: 60,
    height: 60,
    [theme.breakpoints.down('1520')]: {
      width: 50,
      height: 50
    },
    [theme.breakpoints.down('1350')]: {
      width: 40,
      height: 40
    },
    [theme.breakpoints.down('1120')]: {
      width: 30,
      height: 30
    },
    [theme.breakpoints.down('980')]: {
      width: 25,
      height: 25
    },
    [theme.breakpoints.down('900')]: {
      width: 50,
      height: 50,
      marginRight: 0
    }
  },

  walletImagesEmail: {
    marginRight: 20,
    width: 60,
    height: 60,
    [theme.breakpoints.down('1520')]: {
      width: 50,
      height: 50
    },
    [theme.breakpoints.down('1350')]: {
      width: 40,
      height: 40
    },
    [theme.breakpoints.down('1120')]: {
      width: 30,
      height: 30
    },
    [theme.breakpoints.down('980')]: {
      width: 25,
      height: 25
    },
    [theme.breakpoints.down('900')]: {
      width: 50,
      height: 50,
      marginRight: 0
    }
  }
}))

const OtherLogins = () => {
  const classes = useStyles()

  const connectWalletHandler = () => {
    window.location.href = '/msa/team-registration'
  }

  return (
    <Box className={classes.container}>
      <Grid container direction="row" justifyContent="space-evenly" alignItems="center">
        <Grid
          item
          xl={2}
          lg={2}
          md={2}
          sm={12}
          xs={12}
          component="button"
          onClick={connectWalletHandler}
          className={classes.connectBtns}
        >
          <img src="/static/msa/assets/metamask.png" alt="Connect with Metamask" className={classes.walletImageMeta} />
          Metamask
        </Grid>
        <Grid
          item
          xl={2}
          lg={2}
          md={2}
          sm={12}
          xs={12}
          component="button"
          onClick={connectWalletHandler}
          className={classes.connectBtns}
        >
          <img
            src="/static/msa/assets/waletconnect.png"
            alt="Connect with Waletconnect"
            className={classes.walletImagesWalet}
          />
          Waletconnect
        </Grid>
        <Grid
          item
          xl={2}
          lg={2}
          md={2}
          sm={12}
          xs={12}
          component="button"
          onClick={connectWalletHandler}
          className={classes.connectBtns}
        >
          <img src="/static/msa/assets/gmail-icon.png" alt="Connect with Email" className={classes.walletImagesEmail} />
          Email
        </Grid>
      </Grid>
    </Box>
  )
}

export default OtherLogins
