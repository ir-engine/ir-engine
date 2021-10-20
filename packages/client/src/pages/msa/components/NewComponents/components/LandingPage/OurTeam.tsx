import React from 'react'

import { Box, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  backgroundImage: {
    backgroundImage: `url("/static/msa/assets/ourTeam-background.svg")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    height: 'auto',
    width: '100%'
    // marginTop: '-2.5em',
    // [theme.breakpoints.down('900')]: {
    //   marginTop: '-2em'
    // },
    // [theme.breakpoints.down('600')]: {
    //   marginTop: '-1.5em'
    // }
  },

  content: {
    color: '#fff',
    textAlign: 'center'
  },

  heading: {
    paddingTop: '3.5em',
    fontSize: '60px',
    fontWeight: 300,
    [theme.breakpoints.down('1010')]: {
      fontSize: '55px'
    },
    [theme.breakpoints.down('900')]: {
      fontSize: '45px'
    },
    [theme.breakpoints.down('600')]: {
      fontSize: '40px'
    },
    [theme.breakpoints.down('380')]: {
      fontSize: '35px',
      width: '100%'
    }
  },

  teamMembers: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: '10%',
    paddingBottom: '3%',
    [theme.breakpoints.down('1010')]: {
      marginTop: '25%'
    },
    [theme.breakpoints.down('900')]: {
      justifyContent: 'center'
    }
  },

  membersImage: {
    transition: 'transform .8s ease',
    '&:hover': {
      transform: 'scale(1.2)',
      overflow: 'hidden'
    }
  },

  membersName: {
    fontWeight: 300,
    fontSize: 30,
    // marginBottom: '-15px',
    [theme.breakpoints.down('900')]: {
      fontSize: 25
    }
  },

  image: {
    width: 200,
    height: 200,
    [theme.breakpoints.down('900')]: {
      width: 150,
      height: 150
    },
    [theme.breakpoints.down('600')]: {
      width: 120,
      height: 120
    },
    [theme.breakpoints.down('380')]: {
      width: 70,
      height: 70
    }
  }
}))

const OurTeam = (props: any): any => {
  const classes = useStyles()

  return (
    <div className={classes.backgroundImage}>
      <Box className={classes.content}>
        <Box component={'h1'} className={classes.heading}>
          OUR TEAM
        </Box>

        <Grid container direction="row" className={classes.teamMembers}>
          <Grid item xl={3} lg={3} md={3} sm={6} xs={12}>
            <Box className={classes.membersImage}>
              <img src="/static/msa/assets/team-member1.svg" alt="Team Member-1" className={classes.image} />
            </Box>
            <Box component="h2" className={classes.membersName}>
              Harrison Hines
            </Box>
            <Box component="p" fontWeight={200}>
              FLEEK CO
            </Box>
          </Grid>
          <Grid item xl={3} lg={3} md={3} sm={6} xs={12}>
            <Box className={classes.membersImage}>
              <img src="/static/msa/assets/team-member2.svg" alt="Team Member-2" className={classes.image} />
            </Box>
            <Box component="h2" className={classes.membersName}>
              Devin Richman
            </Box>
            <Box component="p" fontWeight={200}>
              BUBBADUTCH
            </Box>
          </Grid>
          <Grid item xl={3} lg={3} md={3} sm={6} xs={12}>
            <Box className={classes.membersImage}>
              <img src="/static/msa/assets/team-member3.svg" alt="Team Member-3" className={classes.image} />
            </Box>
            <Box component="h2" className={classes.membersName}>
              Mason Rishman
            </Box>
            <Box component="p" fontWeight={200}>
              BUBBADUTCH
            </Box>
          </Grid>
          <Grid item xl={3} lg={3} md={3} sm={6} xs={12}>
            <Box className={classes.membersImage}>
              <img src="/static/msa/assets/team-member4.svg" alt="Team Member-4" className={classes.image} />
            </Box>
            <Box component="h2" className={classes.membersName}>
              Shaw Walters
            </Box>
            <Box component="p" fontWeight={200}>
              LAGUNA LABS
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default OurTeam
