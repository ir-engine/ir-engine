import React from 'react'

import { Box } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  container: {
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: '3em'
  },

  heading: {
    textTransform: 'uppercase',
    fontWeight: 500,
    fontSize: 20
  },

  connectBtn: {
    color: '#fff',
    background: '#1aacb6',
    borderRadius: 15,
    border: 'none',
    fontSize: 25,
    padding: '25px 80px',
    boxShadow: '0px 2px 3px #000',
    margin: 20
  },

  or: {
    margin: 50,
    fontSize: 30,
    fontWeight: 500
  }
}))

const LoginBtn = () => {
  const classes = useStyles()

  const connectWalletHandler = () => {
    window.location.href = '/msa/team-registration'
  }

  return (
    <Box className={classes.container}>
      <Box component="h1" className={classes.heading}>
        Login with plug
      </Box>

      <Box component="button" onClick={connectWalletHandler} className={classes.connectBtn}>
        Connect Wallet
      </Box>

      <Box component="h3" className={classes.or}>
        OR
      </Box>
    </Box>
  )
}

export default LoginBtn
