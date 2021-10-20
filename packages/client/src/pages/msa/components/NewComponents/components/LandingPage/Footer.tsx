import React from 'react'

import { Box, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'

import { Link } from 'react-scroll'

import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp'

const useStyle = makeStyles((theme: any) => ({
  background: {
    width: '100%'
  },

  content: {
    color: '#fff',
    textAlign: 'center',
    marginTop: '5%'
  },

  heading: {
    fontSize: '60px',
    fontWeight: 300,
    textTransform: 'uppercase',
    width: '100%',
    [theme.breakpoints.down('1000')]: {
      fontSize: '55px'
    },
    [theme.breakpoints.down('900')]: {
      fontSize: '50px'
    },
    [theme.breakpoints.down('820')]: {
      fontSize: '45px'
    },
    [theme.breakpoints.down('740')]: {
      fontSize: '40px'
    },
    [theme.breakpoints.down('660')]: {
      fontSize: '35px'
    },
    [theme.breakpoints.down('580')]: {
      fontSize: '30px'
    },
    [theme.breakpoints.down('500')]: {
      fontSize: '25px'
    },
    [theme.breakpoints.down('420')]: {
      fontSize: '20px'
    },
    [theme.breakpoints.down('340')]: {
      fontSize: '18px'
    }
  },

  socialLinks: {
    marginTop: '6%',
    marginBottom: '5%'
  },

  footerLinks: {
    textTransform: 'uppercase',
    fontWeight: 300,
    fontSize: '17px',
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('960')]: {
      fontSize: '16px'
    },
    [theme.breakpoints.down('880')]: {
      fontSize: '15px'
    },
    [theme.breakpoints.down('800')]: {
      fontSize: '14px'
    },
    [theme.breakpoints.down('720')]: {
      fontSize: '13px'
    },
    [theme.breakpoints.down('640')]: {
      fontSize: '12px'
    },
    [theme.breakpoints.down('600')]: {
      justifyContent: 'flex-start'
    },
    [theme.breakpoints.down('560')]: {
      fontSize: '11px'
    },
    [theme.breakpoints.down('480')]: {
      fontSize: '10px'
    },
    [theme.breakpoints.down('400')]: {
      fontSize: '9px'
    },
    [theme.breakpoints.down('320')]: {
      fontSize: '8px'
    }
  },

  backToTop: {
    textTransform: 'uppercase',
    fontWeight: 300,
    fontSize: '17px',
    display: 'flex',
    alignItems: 'center',
    // position: 'absolute',
    // right: '2%',
    // bottom: 0,
    transform: 'translate(90%, -150%)',
    [theme.breakpoints.down('1535')]: {
      transform: 'translate(85%, -150%)'
    },
    [theme.breakpoints.down('960')]: {
      transform: 'translate(80%, -158%)',
      fontSize: '16px'
    },
    [theme.breakpoints.down('880')]: {
      fontSize: '15px'
    },
    [theme.breakpoints.down('800')]: {
      fontSize: '14px',
      transform: 'translate(80%, -185%)'
    },
    [theme.breakpoints.down('720')]: {
      fontSize: '13px',
      transform: 'translate(80%, -200%)'
    },
    [theme.breakpoints.down('640')]: {
      fontSize: '12px',
      transform: 'translate(80%, -225%)'
    },
    [theme.breakpoints.down('560')]: {
      fontSize: '11px',
      transform: 'translate(80%, -275%)'
    },
    [theme.breakpoints.down('480')]: {
      fontSize: '10px',
      transform: 'translate(75%, -285%)'
    },
    [theme.breakpoints.down('400')]: {
      fontSize: '9px',
      transform: 'translate(75%, -275%)'
    },
    [theme.breakpoints.down('320')]: {
      fontSize: '8px',
      transform: 'translate(75%, -270%)'
    }
  },

  image: {
    width: 150,
    height: 150,
    [theme.breakpoints.down('600')]: {
      width: 100,
      height: 100
    },
    [theme.breakpoints.down('500')]: {
      width: 80,
      height: 80
    },
    [theme.breakpoints.down('380')]: {
      width: 60,
      height: 60
    }
  }
}))

const Footer = () => {
  const classes = useStyle()

  return (
    <div className={classes.background}>
      <Box className={classes.content}>
        <Box component={'h1'} className={classes.heading}>
          Join the metasports community
        </Box>

        <Box className={classes.socialLinks}>
          <Grid container direction="row" justifyContent="center" alignItems="center">
            <Grid item xl={2} lg={4} md={4} sm={4} xs={4}>
              <img src="/static/msa/assets/discord.svg" alt="Discord" className={classes.image} />
            </Grid>
            <Grid item xl={2} lg={4} md={4} sm={4} xs={4}>
              <img src="/static/msa/assets/twitter.svg" alt="Twitter" className={classes.image} />
            </Grid>
            <Grid item xl={2} lg={4} md={4} sm={4} xs={4}>
              <img src="/static/msa/assets/instagram.svg" alt="Instagram" className={classes.image} />
            </Grid>
          </Grid>
        </Box>

        <Box className={classes.footerLinks}>
          <Box component="p">Privacy Policy</Box>
          <Box component="p" marginLeft={5}>
            Terms of Service
          </Box>
        </Box>

        {/* Back To top */}
        <Box className={classes.backToTop}>
          Back to top
          <Link activeClass="active" to="top" spy={true} smooth={true}>
            <ArrowCircleUpIcon
              sx={{
                fontSize: 50,
                cursor: 'pointer',
                marginLeft: '15%',
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
      </Box>
    </div>
  )
}

export default Footer
