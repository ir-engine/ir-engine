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
    fontFamily: 'sans-serif',
    fontWeight: 500,
    marginBottom: '2em'
  },

  input: {
    borderRadius: 10,
    border: 'none',
    fontSize: 25,
    padding: '0.5% 20%',
    boxShadow: '0px 2px 3px #000',
    margin: '50px 0px'
  },

  continueBtn: {
    color: '#fff',
    background: '#f68e00',
    borderRadius: 25,
    border: 'none',
    fontSize: 25,
    padding: '1% 8%',
    boxShadow: '0px 2px 3px #000',
    margin: 30
  }
}))

const TeamImage = () => {
  const classes = useStyles()

  const connectWalletHandler = () => {
    window.location.href = '/msa/initial-main-content'
  }

  return (
    <Box className={classes.container}>
      <Box component="h1" className={classes.heading}>
        Upload your Team Image
      </Box>

      <Box>
        <img src="/static/msa/assets/upload-image.png" alt="Upload" />
      </Box>

      <Box component="button" onClick={connectWalletHandler} className={classes.continueBtn}>
        Continue
      </Box>
    </Box>
  )
}

export default TeamImage
