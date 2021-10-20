import React from 'react'

import { Box } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  backgroundImage: {
    backgroundImage: `url("/static/msa/assets/tokenomics-background.svg")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    height: 'auto',
    width: '100%',
    marginTop: '-2.5em'
  },

  background: {
    position: 'relative',
    background: 'rgba(0,0,0,0.5)'
  },

  content: {
    color: '#fff',
    textAlign: 'center'
  },

  heading: {
    fontSize: '60px',
    fontWeight: 400,
    paddingTop: '5em',
    [theme.breakpoints.down('2200')]: {
      fontSize: '60px',
      paddingTop: '4em'
    },
    [theme.breakpoints.down('1000')]: {
      paddingTop: '2.5em'
    },
    [theme.breakpoints.down('600')]: {
      fontSize: '50px',
      paddingTop: '2em'
    },
    [theme.breakpoints.down('500')]: {
      fontSize: '40px',
      paddingTop: '2em'
    },
    [theme.breakpoints.down('400')]: {
      fontSize: '35px',
      paddingTop: '2em'
    },
    [theme.breakpoints.down('300')]: {
      fontSize: '30px',
      paddingTop: '2em'
    }
  },

  roadmapImg: {
    paddingBottom: 80,
    width: 1200,
    height: 600,
    [theme.breakpoints.down('1220')]: {
      width: 1000,
      height: 500
    },
    [theme.breakpoints.down('1000')]: {
      width: 800,
      height: 400
    },
    [theme.breakpoints.down('800')]: {
      width: 700,
      height: 350
    },
    [theme.breakpoints.down('700')]: {
      width: 600,
      height: 300
    },
    [theme.breakpoints.down('600')]: {
      width: 500,
      height: 250
    },
    [theme.breakpoints.down('500')]: {
      width: 400,
      height: 200
    },
    [theme.breakpoints.down('400')]: {
      paddingBottom: 0,
      width: 300,
      height: 250
    },
    [theme.breakpoints.down('300')]: {
      width: 200,
      height: 100
    }
  }
}))

const Roadmap = (props: any): any => {
  const classes = useStyles()

  return (
    <div className={classes.backgroundImage}>
      <div className={classes.background} />
      <Box className={classes.content}>
        <Box component={'h1'} className={classes.heading}>
          Roadmap
        </Box>

        <Box>
          <img src="/static/msa/assets/roadmap-image.svg" alt="Road Map" className={classes.roadmapImg} />
        </Box>
      </Box>
    </div>
  )
}

export default Roadmap
