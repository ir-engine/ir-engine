import React from 'react'

import { Box, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  container: {
    position: 'fixed',
    bottom: 0,
    color: '#fff',
    width: '100%'
  },

  footerLeft: {
    textTransform: 'uppercase',
    textAlign: 'right',
    background: '#e65353',
    padding: '5px 10px 5px 0px',
    [theme.breakpoints.down('900')]: {
      fontSize: 13
    },
    [theme.breakpoints.down('510')]: {
      fontSize: 11
    },
    [theme.breakpoints.down('445')]: {
      fontSize: 10,
      padding: '4px 8px 4px 0px'
    },
    [theme.breakpoints.down('400')]: {
      fontSize: 8,
      padding: '3px 5px 3px 0px'
    },
    [theme.breakpoints.down('320')]: {
      fontSize: 6,
      padding: '2px 3px 2px 0px'
    }
  },

  footerRight: {
    textAlign: 'left',
    background: '#343434',
    padding: '5px 0px 5px 10px',
    fontWeight: 200,
    [theme.breakpoints.down('900')]: {
      fontSize: 13
    },
    [theme.breakpoints.down('510')]: {
      fontSize: 11
    },
    [theme.breakpoints.down('445')]: {
      fontSize: 10,
      padding: '4px 0px 4px 8px'
    },
    [theme.breakpoints.down('400')]: {
      fontSize: 8,
      padding: '3px 0px 3px 5px'
    },
    [theme.breakpoints.down('320')]: {
      fontSize: 6,
      padding: '2px 0px 2px 3px'
    }
  }
}))

const Footer = () => {
  const classes = useStyles()

  return (
    <Box className={classes.container}>
      <Grid container direction="row">
        <Grid item xl={2} lg={2} md={2} sm={2} xs={2} className={classes.footerLeft}>
          MSA Today
        </Grid>
        <Grid item xl={10} lg={10} md={10} sm={10} xs={10} className={classes.footerRight}>
          MetaSports Association News Here
        </Grid>
      </Grid>
    </Box>
  )
}

export default Footer
