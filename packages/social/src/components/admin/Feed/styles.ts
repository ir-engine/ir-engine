import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useFeedStyles = makeStyles((theme: Theme) =>
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
    iconButton: {
      padding: 10,
      color: '#f1f1f1'
    },
    marginBottom: {
      marginBottom: '10px'
    },
    actionStyle: {
      textDecoration: 'none',
      color: '#000',
      marginRight: '10px'
    },
    spanWhite: {
      color: '#f1f1f1'
    },
    span: {
      color: '#808080'
    },
    spanDange: {
      color: '#FF8C00 !important'
    },
    marginTp: {
      marginTop: '20%'
    },
    createInput: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      marginTop: '3px',
      marginBottom: '15px',
      background: '#343b41',
      border: '1px solid #23282c',
      color: '#f1f1f1 !important'
    },
    texAlign: {
      textAlign: 'center'
    },
    btn: {
      background: '#343b41',
      width: '100%'
    },
    redBorder: {
      border: '1px solid red',
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px',
      marginBottom: '15px',
      background: '#343b41',
      color: '#f1f1f1 !important'
    },
    rootTable: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: '#43484F',
      color: '#f1f1f1'
    },
    rootCard: {
      // maxWidth: 345,
      background: '#343b41',
      color: '#f1f1f1'
    },
    feed: {
      height: 140
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
    typo: {
      textTransform: 'capitalize'
    },
    featuredBadge: {
      width: '70px',
      height: '50px',
      fontWeight: 600,
      fontSize: '1.45rem',
      lineHeight: '50px',
      margin: '5px',
      position: 'absolute',
      top: 0,
      right: 10,
      letterSpacing: 0,
      transform: 'rotate(50deg)'
    },
    feature: {
      width: '12rem',
      marginLeft: '-30px'
    },
    title: {
      textTransform: 'capitalize',
      fontSize: '1.3rem'
    },
    chip: {
      marginTop: '10px'
    },
    chipRoot: {
      marginLeft: '10px'
    },
    cardPaper: {
      padding: theme.spacing(2),
      textAlign: 'end',
      color: '#f1f1f1',
      background: '#343b41',
      boxShadow: 'none'
    },
    views: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      fontSize: '1.2rem',
      paddingTop: '20px',
      paddingLeft: '20px'
    },
    center: {
      margin: '4rem auto 0 auto',
      textAlign: 'center'
    },
    mt5: {
      marginTop: '6%'
    },
    space: {
      padding: '1.2rem'
    },
    cardHolder: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#343b41'
    },
    Card: {
      marginTop: '10px'
    },
    image: {
      height: '18rem',
      width: '100%',
      borderRadius: '5px'
    },
    containerMargin: {
      marginTop: '.7rem'
    },
    wrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    view: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      fontSize: '1.2rem',
      marginRight: '40px'
    },
    Bottom: {
      marginBottom: '20px'
    },
    alert: {
      background: '#343b41',
      color: '#f1f1f1'
    },
    spanNone: {
      color: '#808080'
    },
    mgBtn: {
      marginBottom: '25px'
    },
    contSize: {
      marginTop: '4.5%',
      width: '373px',
      position: 'relative'
    },
    margin: {
      marginTop: '70px'
    },
    pos: {
      position: 'absolute',
      top: '-15px',
      right: '0'
    }
  })
)

export const useFeedStyle = makeStyles({
  paper: {
    maxWidth: '80%',
    minWidth: '40%',
    backgroundColor: '#43484F ',
    color: '#f1f1f1'
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
  },
  root: {
    flexGrow: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
    gridGap: '1rem 20px',
    width: '100%',
    backgroundColor: '#43484F',
    padding: '2rem'
  },
  container: {
    maxHeight: '80vh'
  }
})
