import React from 'react'

import { Box, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  container: {
    position: 'absolute',
    bottom: '10%',
    width: '100%'
  },

  btns: {
    background: 'rgba(0, 0, 0, 0.6)',
    padding: '30px 0px 30px 30px',
    cursor: 'pointer',
    '&:hover': {
      background: '#fff',
      color: '#000'
    },
    [theme.breakpoints.down('380')]: {
      padding: '20px 0px 20px 20px'
    }
  },

  btnHeading: {
    color: '#e0ff65',
    fontWeight: 700,
    fontSize: 40,
    fontStyle: 'italic',
    fontFamily: 'Inter',
    width: '90%',
    '&:hover': {
      color: '#000'
    },
    [theme.breakpoints.down('800')]: {
      fontSize: 35
    },
    [theme.breakpoints.down('550')]: {
      fontSize: 30
    },
    [theme.breakpoints.down('460')]: {
      fontSize: 25
    },
    [theme.breakpoints.down('400')]: {
      fontSize: 20
    },
    [theme.breakpoints.down('350')]: {
      fontSize: 18
    },
    [theme.breakpoints.down('320')]: {
      fontSize: 15
    },
    [theme.breakpoints.down('290')]: {
      fontSize: 13
    }
  },

  btnDescription: {
    width: '35%',
    [theme.breakpoints.down('1805')]: {
      width: '37%'
    },
    [theme.breakpoints.down('1710')]: {
      width: '40%'
    },
    [theme.breakpoints.down('1585')]: {
      width: '43%'
    },
    [theme.breakpoints.down('1481')]: {
      width: '45%'
    },
    [theme.breakpoints.down('1420')]: {
      width: '48%'
    },
    [theme.breakpoints.down('1335')]: {
      width: '50%'
    },
    [theme.breakpoints.down('1285')]: {
      width: '53%'
    },
    [theme.breakpoints.down('1215')]: {
      width: '56%'
    },
    [theme.breakpoints.down('1155')]: {
      width: '60%'
    },
    [theme.breakpoints.down('1085')]: {
      width: '63%'
    },
    [theme.breakpoints.down('1035')]: {
      width: '66%'
    },
    [theme.breakpoints.down('990')]: {
      width: '70%'
    },
    [theme.breakpoints.down('940')]: {
      width: '73%'
    },
    [theme.breakpoints.down('904')]: {
      width: '70%',
      fontSize: 11
    },
    [theme.breakpoints.down('867')]: {
      width: '73%'
    },
    [theme.breakpoints.down('835')]: {
      width: '76%'
    },
    [theme.breakpoints.down('800')]: {
      width: '73%',
      fontSize: 10
    },
    [theme.breakpoints.down('765')]: {
      width: '76%'
    },
    [theme.breakpoints.down('736')]: {
      width: '80%'
    },
    [theme.breakpoints.down('705')]: {
      width: '76%',
      fontSize: 9
    },
    [theme.breakpoints.down('670')]: {
      width: '80%'
    },
    [theme.breakpoints.down('640')]: {
      width: '83%'
    },
    [theme.breakpoints.down('620')]: {
      width: '86%'
    },
    [theme.breakpoints.down('600')]: {
      width: '70%',
      fontSize: 7
    },
    [theme.breakpoints.down('445')]: {
      width: '100%'
    }
  }
}))

const MainContent = () => {
  const classes = useStyles()

  return (
    <Box className={classes.container}>
      <Grid container justifyContent="center" rowGap={2} columnGap={2}>
        <Grid item xl={5} lg={5} md={5} sm={5} xs={5} className={classes.btns}>
          <Box component="h1" className={classes.btnHeading}>
            Play Now
          </Box>
          <Box component="p" className={classes.btnDescription}>
            Put your team in, pick from a staked or unstaked, and start playing.
          </Box>
        </Grid>
        <Grid item xl={5} lg={5} md={5} sm={5} xs={5} className={classes.btns}>
          <Box component="h1" className={classes.btnHeading}>
            My Squad
          </Box>
          <Box component="p" className={classes.btnDescription}>
            Put your team in, pick from a staked or unstaked, and start playing.
          </Box>
        </Grid>
        <Grid item xl={5} lg={5} md={5} sm={5} xs={5} className={classes.btns}>
          <Box component="h1" className={classes.btnHeading}>
            Marketplace
          </Box>
        </Grid>
        <Grid item xl={5} lg={5} md={5} sm={5} xs={5} className={classes.btns}>
          <Box component="h1" className={classes.btnHeading}>
            Settings
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MainContent
