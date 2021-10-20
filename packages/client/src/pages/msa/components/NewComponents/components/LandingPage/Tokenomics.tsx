import React from 'react'

import { Box, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'

// import styles from "../../styles/LandingPage/Tokenomics.module.css";

const useStyles = makeStyles((theme: any) => ({
  backgroundImage: {
    backgroundImage: `url("/static/msa/assets/tokenomics-background.svg")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    height: 'auto',
    width: '100%',
    marginTop: '-2%',

    [theme.breakpoints.down('1880')]: {
      marginTop: '-3%'
    },
    [theme.breakpoints.down('1400')]: {
      marginTop: '-4%'
    },
    [theme.breakpoints.down('1050')]: {
      marginTop: '-4%'
    },
    [theme.breakpoints.down('1000')]: {
      marginTop: '-5%'
    },
    [theme.breakpoints.down('900')]: {
      marginTop: '-6%'
    },
    [theme.breakpoints.down('600')]: {
      marginTop: '-8%'
    },
    [theme.breakpoints.down('400')]: {
      marginTop: '-10%'
    },
    [theme.breakpoints.down('350')]: {
      marginTop: '-12%'
    }
  },

  content: {
    color: '#fff',
    textAlign: 'center'
  },

  heading: {
    paddingTop: '15%',
    marginBottom: '10%',
    fontSize: '45px',
    fontWeight: 300,
    [theme.breakpoints.down('470')]: {
      fontSize: '40px'
    },
    [theme.breakpoints.down('300')]: {
      fontSize: '30px'
    }
  },

  gridContainer: {
    justifyContent: 'space-evenly',
    alignItems: 'center'
    // [theme.breakpoints.down('600')]: {
    //   // marginTop: -70
    // },
    // [theme.breakpoints.down('470')]: {
    //   // marginTop: -60
    // }
  },

  gridHeading: {
    fontSize: '25px',
    fontWeight: 300,
    [theme.breakpoints.down('360')]: {
      fontSize: '20px'
    }
  },

  gridPara: {
    fontSize: '15px',
    fontWeight: 200,
    [theme.breakpoints.down('470')]: {
      fontSize: '13px'
    },
    [theme.breakpoints.down('360')]: {
      fontSize: '11px'
    }
  },

  group2: {
    marginTop: 320,
    paddingBottom: 40,
    [theme.breakpoints.down('900')]: {
      marginTop: 230
    },
    [theme.breakpoints.down('890')]: {
      marginTop: 180
    },
    [theme.breakpoints.down('600')]: {
      marginTop: 120
    },
    [theme.breakpoints.down('411')]: {
      marginTop: 60
    }
  }
}))

const Tokenomics = (props: any): any => {
  const classes = useStyles()

  return (
    <div className={classes.backgroundImage}>
      <Box className={classes.content}>
        <Box component={'h3'} className={classes.heading}>
          Tokenomics
        </Box>

        <Box>
          <Grid container className={classes.gridContainer} spacing={2}>
            <Grid item xl={3} lg={3} md={3} sm={8} xs={8}>
              <Box component={'h4'} className={classes.gridHeading}>
                STAKING
              </Box>
              <Box component={'p'} className={classes.gridPara}>
                Metasports Basketball is a blockchain basketball management game. The game uses the blockchain to ensure
                the authenticity of its collectibles, which are all unique digital assets.
              </Box>
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={8} xs={8}>
              <Box component={'h4'} className={classes.gridHeading}>
                PAYMENT
              </Box>
              <Box component={'p'} className={classes.gridPara}>
                Metasports Basketball is a blockchain basketball management game. The game uses the blockchain to ensure
                the authenticity of its collectibles, which are all unique digital assets.
              </Box>
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={8} xs={8}>
              <Box component={'h4'} className={classes.gridHeading}>
                GOVERNMENT
              </Box>
              <Box component={'p'} className={classes.gridPara}>
                Metasports Basketball is a blockchain basketball management game. The game uses the blockchain to ensure
                the authenticity of its collectibles, which are all unique digital assets.
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box className={classes.group2}>
          <Box component={'h3'} className={classes.heading}>
            Token Metrics
          </Box>
          <Box>
            <Grid container className={classes.gridContainer} spacing={2}>
              <Grid item xl={1} lg={2} md={2} sm={3} xs={12}>
                <Box component={'h4'} className={classes.gridHeading}>
                  59,985,000
                </Box>
                <Box component={'p'} className={classes.gridPara}>
                  SUPPLY AT PUBLIC SALE
                </Box>
              </Grid>
              <Grid item xl={1} lg={2} md={2} sm={3} xs={12}>
                <Box component={'h4'} className={classes.gridHeading}>
                  $0.1
                </Box>
                <Box component={'p'} className={classes.gridPara}>
                  PUBLIC SALE PRICE
                </Box>
              </Grid>
              <Grid item xl={1} lg={2} md={2} sm={3} xs={12}>
                <Box component={'h4'} className={classes.gridHeading}>
                  270,000,000
                </Box>
                <Box component={'p'} className={classes.gridPara}>
                  TOTAL SUPPLY
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export default Tokenomics
