import React from 'react'

import { Box, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'

import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown'

import { Link } from 'react-scroll'

// import headerWhiteImg from "../../msa/assets/headerWhiteImg.svg";
// import stripesGroup from "../../msa/assets/stripes-group.png";
// import headerBoy from "../../msa/assets/header-guy.png";
// import headerGirl from "../../msa/assets/header-girl.png";

const useStyles = makeStyles((theme: any) => ({
  background: {
    textAlign: 'center',
    position: 'relative'
  },

  stripesText: {
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 40,
    textTransform: 'uppercase',
    textShadow: '3px 3px 30px #000',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    [theme.breakpoints.down('1550')]: {
      fontSize: 35
    },
    [theme.breakpoints.down('1250')]: {
      fontSize: 30
    },
    [theme.breakpoints.down('1100')]: {
      fontSize: 25
    },
    [theme.breakpoints.down('900')]: {
      fontSize: 20
    },
    [theme.breakpoints.down('710')]: {
      top: '40%',
      fontSize: 15
    },
    [theme.breakpoints.down('500')]: {
      fontSize: 12
    },
    [theme.breakpoints.down('380')]: {
      fontSize: 10
    },
    [theme.breakpoints.down('325')]: {
      top: '45%',
      fontSize: 8
    }
  },

  headerContent: {
    marginTop: 10,
    marginRight: 100,
    [theme.breakpoints.down('1360')]: {
      marginTop: 30
    },
    [theme.breakpoints.down('800')]: {
      marginTop: 0
    }
  },

  headerText: {
    textAlign: 'center',
    color: '#fff',
    width: '20%',
    marginTop: '-350px !important',
    [theme.breakpoints.down('1560')]: {
      width: '20%'
    },
    [theme.breakpoints.down('1360')]: {
      marginTop: '-250px !important'
    },
    [theme.breakpoints.down('900')]: {
      width: '30%'
    },
    [theme.breakpoints.down('950')]: {
      marginTop: '-120px !important'
    },
    [theme.breakpoints.down('800')]: {
      marginTop: '-60px !important'
    },
    [theme.breakpoints.down('680')]: {
      marginTop: '-90px !important'
    },
    [theme.breakpoints.down('550')]: {
      marginTop: '-70px !important'
    },
    [theme.breakpoints.down('410')]: {
      marginTop: '-30px !important'
    }
  },

  headerTextHeading: {
    textTransform: 'uppercase',
    fontWeight: 400,
    fontSize: 40,
    [theme.breakpoints.down('1550')]: {
      fontSize: 35
    },
    [theme.breakpoints.down('1250')]: {
      fontSize: 30
    },
    [theme.breakpoints.down('1100')]: {
      fontSize: 25
    },
    [theme.breakpoints.down('820')]: {
      fontSize: 20
    },
    [theme.breakpoints.down('680')]: {
      top: '40%',
      fontSize: 15
    },
    [theme.breakpoints.down('550')]: {
      fontSize: 12
    },
    [theme.breakpoints.down('410')]: {
      fontSize: 10
    },
    [theme.breakpoints.down('325')]: {
      top: '45%',
      fontSize: 8
    }
  },

  headerTextPara: {
    fontWeight: 200,
    fontSize: 20,
    [theme.breakpoints.down('1550')]: {
      fontSize: 15
    },
    [theme.breakpoints.down('1250')]: {
      fontSize: 13
    },
    [theme.breakpoints.down('1100')]: {
      fontSize: 10
    },
    [theme.breakpoints.down('820')]: {
      fontSize: 8
    },
    [theme.breakpoints.down('680')]: {
      fontSize: 7
    },
    [theme.breakpoints.down('550')]: {
      fontSize: 6,
      marginTop: '-8px'
    },
    [theme.breakpoints.down('410')]: {
      fontSize: 5,
      marginTop: '-6px'
    },
    [theme.breakpoints.down('325')]: {
      fontSize: 4
    }
  },

  guyImg: {
    width: 500,
    height: 750,
    [theme.breakpoints.down('1360')]: {
      width: 450,
      height: 650
    },
    [theme.breakpoints.down('1220')]: {
      width: 400,
      height: 650
    },
    [theme.breakpoints.down('1100')]: {
      width: 350,
      height: 600
    },
    [theme.breakpoints.down('950')]: {
      width: 300,
      height: 500,
      marginTop: 15
    },
    [theme.breakpoints.down('820')]: {
      width: 250,
      height: 430
    },
    [theme.breakpoints.down('680')]: {
      width: 200,
      height: 350
    },
    [theme.breakpoints.down('550')]: {
      width: 150,
      height: 250
    },
    [theme.breakpoints.down('410')]: {
      width: 100,
      height: 200
    }
  },

  girlImg: {
    width: 500,
    height: 700,
    [theme.breakpoints.down('1360')]: {
      width: 450,
      height: 650
    },
    [theme.breakpoints.down('1220')]: {
      width: 400,
      height: 600
    },
    [theme.breakpoints.down('1100')]: {
      width: 350,
      height: 550
    },
    [theme.breakpoints.down('950')]: {
      width: 300,
      height: 400
    },
    [theme.breakpoints.down('820')]: {
      width: 250,
      height: 350
    },
    [theme.breakpoints.down('680')]: {
      width: 200,
      height: 300
    },
    [theme.breakpoints.down('550')]: {
      width: 150,
      height: 200
    },
    [theme.breakpoints.down('410')]: {
      width: 100,
      height: 165,
      marginTop: 10
    }
  },

  imageMainDiv: {
    display: 'inline-block',
    maxWidth: '100%',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    margin: '0px'
  },
  imageDiv: {
    boxSizing: 'border-box',
    display: 'block',
    maxWidth: '100%'
  },
  whiteImg: {
    maxWidth: '100%',
    display: 'block',
    margin: '0px',
    border: 'none',
    padding: '0px'
  },
  image: {
    position: 'absolute',
    inset: '0px',
    boxSizing: 'border-box',
    padding: '0px',
    border: 'none',
    margin: 'auto',
    display: 'block',
    width: '0px',
    height: '0px',
    minWidth: '100%',
    maxWidth: '100%',
    minHeight: '100%',
    maxHeight: '100%'
  }
}))

const Header = (props: any): any => {
  const classes = useStyles()

  return (
    <>
      <Box className={classes.background}>
        <div className={classes.imageMainDiv}>
          <div className={classes.imageDiv}>
            <img src="/static/msa/assets/headerWhiteImg.svg" alt="stripesBack" className={classes.whiteImg} />
          </div>
          <img
            src="/static/msa/assets/stripes-group.png"
            alt="Stripes"
            className={classes.image}
            width={3000}
            height={120}
          />
        </div>
        <Box className={classes.stripesText} style={{}}>
          Start your franchise today
        </Box>
      </Box>

      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        className={classes.headerContent}
      >
        <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
          <img src="/static/msa/assets/header-guy.png" alt="Basketball Player" className={classes.guyImg} />
        </Grid>

        <Grid item xl={4} lg={4} md={4} sm={4} xs={4} className={classes.headerText}>
          <Box>
            <Box component="h1" className={classes.headerTextHeading}>
              Collect
            </Box>
            <Box component="p" className={classes.headerTextPara}>
              Build the ultimate basketball team by collecting NFT athletes.
            </Box>
          </Box>
          <Box>
            <Box component="h1" className={classes.headerTextHeading}>
              Play To Earn
            </Box>
            <Box component="p" className={classes.headerTextPara}>
              Play online as the GM & Coach to bring your franchise to the all time earners list.
            </Box>
          </Box>
          <Box
            sx={{
              marginBottom: 7,
              '@media (max-width: 680px)': {
                marginBottom: 4
              },
              '@media (max-width: 550px)': {
                marginBottom: 2
              }
            }}
          >
            <Box component="h1" className={classes.headerTextHeading}>
              Community
            </Box>
            <Box component="p" className={classes.headerTextPara}>
              Join leagues, build dynasties, and hang out in our discord community.
            </Box>
          </Box>
          <Box>
            <Link activeClass="active" to="manageComponent" spy={true} smooth={true}>
              <ArrowCircleDownIcon
                sx={{
                  fontSize: 50,
                  cursor: 'pointer',
                  '@media (max-width: 960px)': {
                    fontSize: 45
                  },
                  '@media (max-width: 880px)': {
                    fontSize: 40
                  },
                  '@media (max-width: 800px)': {
                    fontSize: 35
                  },
                  '@media (max-width: 720px)': {
                    fontSize: 30
                  },
                  '@media (max-width: 640px)': {
                    fontSize: 25
                  },
                  '@media (max-width: 560px)': {
                    fontSize: 20
                  }
                }}
              />
            </Link>
          </Box>
        </Grid>

        <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
          <img src="/static/msa/assets/header-girl.png" alt="Basketball Player" className={classes.girlImg} />
        </Grid>
      </Grid>
    </>
  )
}

export default Header
