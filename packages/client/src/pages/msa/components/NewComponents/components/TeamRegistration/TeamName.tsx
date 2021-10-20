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
    fontWeight: 500
  },

  input: {
    borderRadius: 10,
    border: 'none',
    fontSize: 25,
    padding: '0.5% 20%',
    boxShadow: '0px 2px 3px #000',
    margin: '50px 0px'
  }
}))

const TeamName = () => {
  const classes = useStyles()

  return (
    <Box className={classes.container}>
      <Box component="h1" className={classes.heading}>
        Enter your team name
      </Box>

      <Box component="input" className={classes.input}></Box>
    </Box>
  )
}

export default TeamName
