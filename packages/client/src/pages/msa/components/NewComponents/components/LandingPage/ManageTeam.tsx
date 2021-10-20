import React from 'react'

import { Box } from '@mui/material'
import { makeStyles } from '@mui/styles'

// import styles from '../../styles/LandingPage/ManageTeam.module.css'

// import whiteImg from '../../msa/assets/whiteImg.svg'
// import manageImage from '../../msa/assets/manage-image.png'

const useStyles = makeStyles((theme: any) => ({
  backgroundImage: {
    backgroundImage: `url("/static/msa/assets/manage-background.svg")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    height: 'auto',
    width: '100%',
    marginTop: '-24em',
    position: 'relative',

    [theme.breakpoints.down('1360')]: {
      marginTop: '-17em'
    },
    [theme.breakpoints.down('950')]: {
      marginTop: '-11em'
    },
    [theme.breakpoints.down('820')]: {
      marginTop: '-10em'
    },
    [theme.breakpoints.down('800')]: {
      marginTop: '-8em'
    },
    [theme.breakpoints.down('550')]: {
      marginTop: '-7em'
    },
    [theme.breakpoints.down('480')]: {
      marginTop: '-6.5em'
    },
    [theme.breakpoints.down('410')]: {
      marginTop: '-4em'
    }
  },

  content: {
    position: 'relative',
    lineHeight: '35px',
    color: '#fff'
  },

  contentTop: {
    textAlign: 'left'
  },

  topHeading: {
    fontSize: 85,
    marginLeft: 120,
    marginBottom: 50,
    paddingTop: 180,
    [theme.breakpoints.down('1710')]: {
      fontSize: 80
    },
    [theme.breakpoints.down('1610')]: {
      fontSize: 75
    },
    [theme.breakpoints.down('1510')]: {
      fontSize: 70
    },
    [theme.breakpoints.down('1410')]: {
      fontSize: 65
    },
    [theme.breakpoints.down('1310')]: {
      fontSize: 60
    },
    [theme.breakpoints.down('1210')]: {
      fontSize: 55
    },
    [theme.breakpoints.down('1110')]: {
      fontSize: 50
    },
    [theme.breakpoints.down('1010')]: {
      fontSize: 45
    },
    [theme.breakpoints.down('940')]: {
      marginLeft: 70
    },
    [theme.breakpoints.down('910')]: {
      fontSize: 40
    },
    [theme.breakpoints.down('840')]: {
      marginLeft: 40
    },
    [theme.breakpoints.down('810')]: {
      fontSize: 35,
      marginBottom: 0
    },
    [theme.breakpoints.down('780')]: {
      marginLeft: 20
    },
    [theme.breakpoints.down('710')]: {
      fontSize: 30,
      marginLeft: 10
    },
    [theme.breakpoints.down('680')]: {
      paddingTop: 120
    },
    [theme.breakpoints.down('640')]: {
      fontSize: 25
    },
    [theme.breakpoints.down('530')]: {
      fontSize: 23,
      paddingTop: 100
    },
    [theme.breakpoints.down('490')]: {
      fontSize: 20
    },
    [theme.breakpoints.down('445')]: {
      fontSize: 18,
      paddingTop: 80
    },
    [theme.breakpoints.down('400')]: {
      fontSize: 16
    },
    [theme.breakpoints.down('360')]: {
      fontSize: 14,
      paddingTop: 60
    },
    [theme.breakpoints.down('320')]: {
      fontSize: 13,
      lineHeight: '15px',
      paddingTop: 40
    }
  },

  topPara: {
    width: '68%',
    fontSize: 30,
    fontWeight: 200,
    marginLeft: 120,
    marginBottom: 50,
    [theme.breakpoints.down('1210')]: {
      fontSize: 25
    },
    [theme.breakpoints.down('1110')]: {
      fontSize: 20,
      lineHeight: '22px'
    },
    [theme.breakpoints.down('940')]: {
      marginLeft: 70
    },
    [theme.breakpoints.down('840')]: {
      marginLeft: 40
    },
    [theme.breakpoints.down('800')]: {
      fontSize: 18
    },
    [theme.breakpoints.down('780')]: {
      marginLeft: 20
    },
    [theme.breakpoints.down('710')]: {
      fontSize: 16,
      width: '100%',
      lineHeight: '20px',
      marginLeft: 10
    },

    [theme.breakpoints.down('640')]: {
      fontSize: 15
    },
    [theme.breakpoints.down('600')]: {
      fontSize: 13,
      lineHeight: '18px'
    },
    [theme.breakpoints.down('360')]: {
      fontSize: 11,
      lineHeight: '16px'
    },
    [theme.breakpoints.down('320')]: {
      fontSize: 10
    }
  },

  centeredLeftImage: {
    marginLeft: 120,
    [theme.breakpoints.down('940')]: {
      marginLeft: 70
    },
    [theme.breakpoints.down('840')]: {
      marginLeft: 40
    },
    [theme.breakpoints.down('780')]: {
      marginLeft: 20
    },
    [theme.breakpoints.down('710')]: {
      marginLeft: 6,
      marginRight: 6
    }
  },

  contentBottom: {
    textAlign: 'right'
    // marginRight: 120,
  },

  bottomHeading: {
    fontSize: 85,
    marginBottom: 50,
    [theme.breakpoints.down('1710')]: {
      fontSize: 80
    },
    [theme.breakpoints.down('1610')]: {
      fontSize: 75
    },
    [theme.breakpoints.down('1510')]: {
      fontSize: 70
    },
    [theme.breakpoints.down('1410')]: {
      fontSize: 65
    },
    [theme.breakpoints.down('1310')]: {
      fontSize: 60
    },
    [theme.breakpoints.down('1210')]: {
      fontSize: 55
    },
    [theme.breakpoints.down('1110')]: {
      fontSize: 50
    },
    [theme.breakpoints.down('1010')]: {
      fontSize: 45
    },
    [theme.breakpoints.down('910')]: {
      fontSize: 40
    },
    [theme.breakpoints.down('810')]: {
      fontSize: 35,
      marginBottom: 0
    },
    [theme.breakpoints.down('710')]: {
      fontSize: 30
    },
    [theme.breakpoints.down('640')]: {
      fontSize: 25
    },
    [theme.breakpoints.down('530')]: {
      fontSize: 23
    },
    [theme.breakpoints.down('490')]: {
      fontSize: 20
    },
    [theme.breakpoints.down('445')]: {
      fontSize: 18
    },
    [theme.breakpoints.down('400')]: {
      fontSize: 16
    },
    [theme.breakpoints.down('360')]: {
      fontSize: 14
    },
    [theme.breakpoints.down('320')]: {
      fontSize: 13
    }
  },

  bottomPara: {
    marginLeft: '30%',
    fontSize: 30,
    fontWeight: 300,
    paddingBottom: '8%',
    [theme.breakpoints.down('1210')]: {
      fontSize: 25
    },
    [theme.breakpoints.down('1110')]: {
      fontSize: 20,
      lineHeight: '22px'
    },
    [theme.breakpoints.down('800')]: {
      fontSize: 18
    },
    [theme.breakpoints.down('710')]: {
      marginLeft: '0',
      fontSize: 16,
      width: '100%',
      lineHeight: '20px'
    },
    [theme.breakpoints.down('640')]: {
      fontSize: 15
    },
    [theme.breakpoints.down('600')]: {
      fontSize: 13,
      lineHeight: '18px'
    },
    [theme.breakpoints.down('360')]: {
      fontSize: 11,
      lineHeight: '16px'
    },
    [theme.breakpoints.down('320')]: {
      fontSize: 10
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

const ManageTeam = (props: any): any => {
  const classes = useStyles()

  return (
    <>
      <div className={classes.backgroundImage} id="manageComponent">
        <Box className={classes.content}>
          <Box className={classes.contentTop}>
            <Box component="h1" className={classes.topHeading}>
              Manage your team, build your dynasty.
            </Box>
            <Box component="p" className={classes.topPara}>
              Metasports Basketball is a blockchain basketball management game. The game uses the blockchain to ensure
              the authenticity of its collectibles, which are all unique digital assets. The game is designed to be
              played in the browser and in the mobile app.
            </Box>
          </Box>
          <Box className={classes.centeredLeftImage}>
            <div className={classes.imageMainDiv}>
              <div className={classes.imageDiv}>
                <img src="/static/msa/assets/whiteImg.svg" alt="imageBack" className={classes.whiteImg} />
              </div>
              <img
                src="/static/msa/assets/manage-image.png"
                alt="Manage"
                className={classes.image}
                width={10}
                height={10}
              />
            </div>
          </Box>
          <Box className={classes.contentBottom}>
            <Box component="h1" className={classes.bottomHeading}>
              Anytime, anywhere.
            </Box>
            <Box component="p" className={classes.bottomPara}>
              Metasports Basketball is a blockchain basketball management game. The game uses the blockchain to ensure
              the authenticity of its collectibles, which are all unique digital assets. The game is designed to be
              played in the browser and in the mobile app.
            </Box>
          </Box>
        </Box>
      </div>
    </>
  )
}

export default ManageTeam
