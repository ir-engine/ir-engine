import React from 'react'

import { Box, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'

import NotificationsIcon from '@mui/icons-material/Notifications'

const useStyles = makeStyles((theme: any) => ({
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    color: '#ffffff',
    padding: '15px 40px',
    '& a': {
      textDecoration: 'none',
      color: '#fff'
    },
    [theme.breakpoints.down('1550')]: {
      padding: '15px 90px 15px 20px'
    },
    [theme.breakpoints.down('950')]: {
      padding: '15px 100px 15px 20px'
    },
    [theme.breakpoints.down('600')]: {
      padding: '15px 70px 15px 20px'
    },
    [theme.breakpoints.down('500')]: {
      padding: '15px 50px 15px 20px'
    },
    [theme.breakpoints.down('500')]: {
      padding: '15px 40px 15px 20px'
    }
  },

  back: {
    color: '#878787',
    fontSize: 16,
    fontWeight: 500
  },

  logo: {
    // marginLeft: 20,
    fontWeight: 500,
    fontSize: 25,
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

  navMenu: {
    fontWeight: 500,
    fontSize: 18,
    [theme.breakpoints.down('1240')]: {
      fontSize: 15
    },
    [theme.breakpoints.down('1100')]: {
      fontSize: 14
    },
    [theme.breakpoints.down('910')]: {
      fontSize: 13
    },
    [theme.breakpoints.down('860')]: {
      fontSize: 12
    },
    [theme.breakpoints.down('810')]: {
      fontSize: 11
    },
    [theme.breakpoints.down('770')]: {
      fontSize: 10
    },
    [theme.breakpoints.down('705')]: {
      fontSize: 9
    },
    [theme.breakpoints.down('660')]: {
      fontSize: 8
    },
    [theme.breakpoints.down('570')]: {
      fontSize: 7
    },
    [theme.breakpoints.down('515')]: {
      fontSize: 6
    },
    [theme.breakpoints.down('370')]: {
      fontSize: 5
    },
    [theme.breakpoints.down('310')]: {
      fontSize: 4
    }
  },

  notification: {
    borderRight: '1px solid #fff',
    textAlign: 'center',
    position: 'relative'

    // "&::after": {
    //   content: "",
    //   height: "80%",
    //   width: "12px",

    //   position: "absolute",
    //   right: 0,
    //   top: 0,

    //   backgroundColor: "#fff",
    // },
  },

  coins: {
    background: '#e0ff65',
    color: '#000',
    textAlign: 'center',
    padding: '7px 0px',
    fontWeight: 800,
    fontSize: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('1550')]: {
      fontSize: 15,
      '& img': {
        width: 17,
        height: 17
      }
    },
    [theme.breakpoints.down('1390')]: {
      fontSize: 13,
      '& img': {
        width: 15,
        height: 15
      }
    },
    [theme.breakpoints.down('1250')]: {
      fontSize: 11,
      '& img': {
        width: 13,
        height: 13
      }
    },
    [theme.breakpoints.down('11200')]: {
      fontSize: 10,
      padding: '5px 0px',
      '& img': {
        width: 13,
        height: 13
      }
    },
    [theme.breakpoints.down('1035')]: {
      fontSize: 9,
      '& img': {
        width: 11,
        height: 11
      }
    },
    [theme.breakpoints.down('930')]: {
      fontSize: 8,
      '& img': {
        width: 10,
        height: 10
      }
    },
    [theme.breakpoints.down('825')]: {
      fontSize: 7,
      '& img': {
        width: 9,
        height: 9
      }
    },
    [theme.breakpoints.down('721')]: {
      fontSize: 6,
      '& img': {
        width: 8,
        height: 8
      }
    },
    [theme.breakpoints.down('650')]: {
      fontSize: 5,
      padding: '3px 0px',
      '& img': {
        width: 7,
        height: 7
      }
    },
    [theme.breakpoints.down('530')]: {
      fontSize: 4,
      '& img': {
        width: 6,
        height: 6
      }
    },
    [theme.breakpoints.down('370')]: {
      fontSize: 3.5,
      '& img': {
        width: 5.5,
        height: 5.5
      }
    },
    [theme.breakpoints.down('340')]: {
      fontSize: 3,
      '& img': {
        width: 5,
        height: 5
      }
    },
    [theme.breakpoints.down('305')]: {
      fontSize: 2.5,
      '& img': {
        width: 4.5,
        height: 4.5
      }
    }
  },

  coinsTxt: {
    marginLeft: 10,
    [theme.breakpoints.down('1090')]: {
      marginLeft: 8
    },
    [theme.breakpoints.down('1005')]: {
      marginLeft: 6
    },
    [theme.breakpoints.down('890')]: {
      marginLeft: 4
    },
    [theme.breakpoints.down('785')]: {
      marginLeft: 2
    },
    [theme.breakpoints.down('601')]: {
      marginLeft: 1
    }
  },

  user: {
    display: 'flex',
    alignItems: 'center',
    borderLeft: '1px solid #fff',
    [theme.breakpoints.down('900')]: {
      fontSize: 15
    },
    [theme.breakpoints.down('800')]: {
      fontSize: 13
    },
    [theme.breakpoints.down('700')]: {
      fontSize: 10
    },
    [theme.breakpoints.down('600')]: {
      fontSize: 9
    },
    [theme.breakpoints.down('500')]: {
      fontSize: 7
    },
    [theme.breakpoints.down('400')]: {
      fontSize: 6
    },
    [theme.breakpoints.down('300')]: {
      fontSize: 5
    }
  },

  notCnUsr: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },

  userImage: {
    marginLeft: 10,
    marginRight: 10,
    [theme.breakpoints.down('900')]: {
      width: 35,
      height: 35
    },
    [theme.breakpoints.down('800')]: {
      width: 30,
      height: 30
    },
    [theme.breakpoints.down('700')]: {
      width: 25,
      height: 25
    },
    [theme.breakpoints.down('600')]: {
      width: 20,
      height: 20
    },
    [theme.breakpoints.down('500')]: {
      width: 15,
      height: 15,
      marginRight: 5
    },
    [theme.breakpoints.down('400')]: {
      width: 10,
      height: 10,
      marginLeft: 5
    },
    [theme.breakpoints.down('300')]: {
      width: 5,
      height: 5
    }
  }
}))

const NavBar = (props): any => {
  const classes = useStyles()

  return (
    <Grid container className={classes.navContainer}>
      {/* <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
        <Box component="a" href="/msa/lander" className={classes.back}>
          <em> Back</em>
        </Box>
      </Grid> */}

      <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
        <Box component="a" href="/msa/lander" title="METASPORTS" className={classes.logo}>
          <em> MetaSport</em>
        </Box>
      </Grid>

      <Grid item xl={3} lg={3} md={3} sm={3} xs={3} className={classes.navMenu}>
        <Grid container direction="row" justifyContent="space-evenly" alignItems="center">
          <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
            <em>Play Now</em>
          </Grid>
          <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
            <em>My Squad</em>
          </Grid>
          <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
            <em>Marketplace</em>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
        <Grid className={classes.notCnUsr} container direction="row" alignItems="center">
          <Grid item xl={3} lg={3} md={3} sm={3} xs={3} className={classes.notification}>
            <NotificationsIcon
              sx={{
                fontSize: 30,
                '@media (max-width: 960px)': {
                  fontSize: 25
                },
                '@media (max-width: 800px)': {
                  fontSize: 20
                },
                '@media (max-width: 700px)': {
                  fontSize: 15
                },
                '@media (max-width: 600px)': {
                  fontSize: 13
                },
                '@media (max-width: 500px)': {
                  fontSize: 11
                },
                '@media (max-width: 370px)': {
                  fontSize: 9
                }
              }}
            />
          </Grid>
          <Grid item xl={3} lg={3} md={3} sm={3} xs={3} className={classes.coins}>
            <img src="/static/msa/assets/coin-logo.svg" alt="Coin Logo" />
            <em className={classes.coinsTxt}>56 691</em>
          </Grid>
          <Grid item xl={3} lg={3} md={3} sm={3} xs={3} className={classes.user}>
            <img src="/static/msa/assets/nav-user.png" alt="User" className={classes.userImage} />
            <em>digitalenemy</em>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default NavBar
