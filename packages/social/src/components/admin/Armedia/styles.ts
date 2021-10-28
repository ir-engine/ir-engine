import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useARMediaStyles = makeStyles((theme: Theme) =>
  createStyles({
    large: {
      width: theme.spacing(14),
      height: theme.spacing(14),
      marginTop: '20%'
    },
    paperHeight: {
      height: '20vh',
      background: '#111',
      color: '#f1f1f1',
      backgroundColor: '#343b41'
    },
    createBtn: {
      height: '50px',
      margin: 'auto 5px',
      width: '100%',
      background: 'rgb(58, 65, 73)',
      color: '#f1f1f1 !important',
      fontSize: '0.8rem'
    },
    searchRoot: {
      padding: '2px 20px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      background: '#343b41'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      color: '#f1f1f1'
    },
    redBorder: {
      border: '1px solid red',
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      //width: "45vw",
      marginTop: '10px',
      marginBottom: '15px',
      background: '#343b41',
      color: '#f1f1f1 !important'
    },
    iconButton: {
      padding: 10,
      color: '#f1f1f1'
    },
    marginBottom: {
      marginBottom: '10px'
    },
    mgBtn: {
      marginBottom: '25px'
    },
    rootTable: {
      flexGrow: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
      gridGap: '1rem 20px',
      width: '100%',
      backgroundColor: '#43484F',
      padding: '2rem'
    },
    containerScroll: {
      /*scroll */
      maxHeight: '90vh',
      boxSizing: 'border-box',
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },
    marginTp: {
      marginTop: '20%'
    },
    texAlign: {
      textAlign: 'center'
    },
    root: {
      width: '100%'
    },
    container: {
      maxHeight: '80vh'
    },
    rootCard: {
      maxWidth: 345,
      background: '#343b41',
      color: '#f1f1f1'
    },
    media: {
      height: 140
    },
    spanDange: {
      color: '#FF8C00'
    },
    spanNone: {
      color: '#808080'
    },
    typo: {
      textTransform: 'capitalize'
    },
    mt20: {
      marginTop: '20%'
    },
    cardHolder: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#343b41'
    },
    space: {
      padding: '1.2rem'
    },
    Card: {
      marginTop: '10px'
    },
    mt10: {
      marginTop: '10%'
    },
    mt5: {
      marginTop: '6%'
    },
    position: {
      marginTop: '1.7rem'
    },
    saveBtn: {
      marginLeft: 'auto',
      background: '#43484F !important',
      // color: '#fff !important',
      width: '150px',
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important'
    },
    createInput: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      //width: "45vw",
      marginTop: '3px',
      marginBottom: '15px',
      background: '#343b41',
      border: '1px solid #23282c',
      color: '#f1f1f1 !important'
    },
    select: {
      color: '#f1f1f1 !important'
    },
    uploadContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      marginBottom: '3.8rem'
    },
    uploadItem: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1.5rem'
    },
    spaceLen: {
      width: '100%',
      padding: '.2rem'
    },
    upload: {
      display: 'flex',
      flexDirection: 'column',
      width: '49%'
    },
    button: {
      background: '#343b41'
    },
    size: {
      height: '15rem'
    },
    btn: {
      background: '#343b41',
      width: '100%'
    },
    alert: {
      background: '#343b41',
      color: '#f1f1f1'
    },
    pos: {
      position: 'relative'
    },
    imageList: {
      width: 500,
      height: 450
    },
    icon: {
      color: 'rgba(255, 0, 0, 0.54)'
    },
    image: {
      height: '18rem',
      width: '100%'
    },
    placeHolderFile: {
      fontSize: '6rem'
    },
    file: {
      textAlign: 'center',
      background: '#43484F !important',
      color: '#f1f1f1',
      width: '10rem',
      marginTop: '.6rem'
    },
    containerFile: {
      marginTop: '.7rem'
    },
    center: {
      margin: '4rem auto 0 auto',
      textAlign: 'center'
    }
  })
)

export const useARMediaStyle = makeStyles({
  paper: {
    maxWidth: '80%',
    minWidth: '40%',
    backgroundColor: '#43484F ',
    color: '#f1f1f1',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },
  paperDialog: {
    background: 'rgb(58, 65, 73) !important',
    color: '#f1f1f1'
  },
  saveBtn: {
    marginLeft: 'auto',
    background: '#43484F !important',
    color: '#fff !important',
    width: '150px',
    marginRight: '25px',
    boxShadow:
      '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important'
  },
  selectPaper: {
    background: '#343b41',
    color: '#f1f1f1'
  }
})

export const useStylePlayer = makeStyles((theme) => {
  return {
    root: {
      [theme.breakpoints.down('md')]: {
        width: '100%'
      },
      background: '#43484F !important'
    },
    playIcon: {
      color: '#f1f1f1 !important',
      '&:hover': {
        color: '#f1f1f1 !important'
      }
    },
    pauseIcon: {
      color: '#f1f1f1 !important',
      '&:hover': {
        color: '#f1f1f1 !important'
      }
    },
    volumeIcon: {
      color: '#f1f1f1 !important',
      '&:hover': {
        color: '#f1f1f1 !important'
      }
    },
    volumeSlider: {
      color: 'black'
    },
    progressTime: {
      color: '#f1f1f1 !important'
    },
    mainSlider: {
      color: '#f1f1f1 !important',
      '& .MuiSlider-rail': {
        color: '#f1f1f1 !important'
      },
      '& .MuiSlider-track': {
        color: '#f1f1f1 !important'
      },
      '& .MuiSlider-thumb': {
        color: '#f1f1f1 !important'
      }
    }
  }
})
