import React from 'react'

import { Box, Link } from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme: any) => ({
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    color: '#ffffff',
    padding: '15px 0px',
    '& a': {
      textDecoration: 'none',
      color: '#fff'
    },
    [theme.breakpoints.down('710')]: {
      padding: '10px 0px'
    }
  },

  logo: {
    display: 'flex',
    marginLeft: 20,
    fontWeight: 300,
    fontSize: 25,
    color: '#fff',
    [theme.breakpoints.down('1240')]: {
      fontSize: 23
    },
    [theme.breakpoints.down('1100')]: {
      fontSize: 20
    },
    [theme.breakpoints.down('900')]: {
      fontSize: 18
    },
    [theme.breakpoints.down('710')]: {
      fontSize: 15
    },
    [theme.breakpoints.down('470')]: {
      fontSize: 11
    },
    [theme.breakpoints.down('400')]: {
      fontSize: 10
    }
  },

  logoImage: {
    width: 30,
    height: 30,
    [theme.breakpoints.down('1240')]: {
      width: 25,
      height: 25
    },
    [theme.breakpoints.down('1100')]: {
      width: 22,
      height: 22
    },
    [theme.breakpoints.down('900')]: {
      width: 20,
      height: 20
    },
    [theme.breakpoints.down('710')]: {
      width: 18,
      height: 18
    },
    [theme.breakpoints.down('470')]: {
      width: 14,
      height: 14
    },
    [theme.breakpoints.down('400')]: {
      width: 12,
      height: 12
    }
  },

  loginBtn: {
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: '50px',
    padding: '8px 20px',
    fontWeight: 200,
    textTransform: 'uppercase',
    fontSize: 18,
    [theme.breakpoints.down('1100')]: {
      fontSize: 16
    },
    [theme.breakpoints.down('900')]: {
      padding: '5px 15px',
      fontSize: 14
    },
    [theme.breakpoints.down('710')]: {
      fontSize: 12
    },
    [theme.breakpoints.down('470')]: {
      padding: '3px 10px',
      fontSize: 10
    },
    [theme.breakpoints.down('335')]: {
      fontSize: 8,
      marginTop: '-40px'
    }
  },

  loginImages: {
    width: 30,
    height: 30,
    [theme.breakpoints.down('1240')]: {
      width: 25,
      height: 25
    },
    [theme.breakpoints.down('1100')]: {
      width: 22,
      height: 22
    },
    [theme.breakpoints.down('900')]: {
      width: 20,
      height: 20
    },
    [theme.breakpoints.down('710')]: {
      width: 18,
      height: 18
    },
    [theme.breakpoints.down('470')]: {
      width: 14,
      height: 14
    }
  }
}))

const NavBar = () => {
  const classes = useStyles()

  return (
    <Box className={classes.navContainer}>
      <Box component="a" href="/msa/lander" title="METASPORTS" className={classes.logo}>
        METASPORTS
        <Box display={'flex'} component="a" href="/msa/lander" title="BASKETBALL" marginLeft={'8px'}>
          <img src="/static/msa/assets/basketball.png" alt="Basket Ball" className={classes.logoImage} />
          <span
            style={{
              marginLeft: '8px',
              color: '#F68E00',
              fontWeight: 400,
              textDecoration: 'none'
            }}
          >
            BASKETBALL
          </span>
        </Box>
      </Box>
      <Box display={'flex'} alignItems={'center'} marginRight={5}>
        <Box marginLeft={3}>
          <Link underline="none" component="a" href="/msa/login" className={classes.loginBtn}>
            Login
          </Link>
        </Box>
        <Box marginLeft={2}>
          <Link underline="none" component="a" href="/msa/login">
            <img src="/static/msa/assets/nav-fox.png" alt="Login-Option-1" className={classes.loginImages} />
          </Link>
        </Box>
        <Box marginLeft={1}>
          <Link underline="none" component="a" href="/msa/login">
            <img src="/static/msa/assets/nav-image.png" alt="Login-Option-2" className={classes.loginImages} />
          </Link>
        </Box>
        <Box marginLeft={1}>
          <Link underline="none" component="a" href="/msa/login">
            <img src="/static/msa/assets/nav-image2.png" alt="Login-Option-3" className={classes.loginImages} />
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default NavBar
