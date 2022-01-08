import { Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useSceneStyles = makeStyles((theme: Theme) =>
  createStyles({
    marginBottom: {
      marginBottom: '10px'
    },
    createBtn: {
      height: '50px',
      margin: 'auto 5px',
      width: '100%',
      background: 'rgb(58, 65, 73)',
      color: '#f1f1f1 !important'
    },
    rootTable: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: '#43484F',
      color: '#f1f1f1'
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
    paperHeight: {
      height: '20vh',
      background: '#111',
      color: '#f1f1f1',
      backgroundColor: '#343b41'
    },
    center: {
      margin: '3rem auto',
      textAlign: 'center'
    },
    typo: {
      textTransform: 'capitalize'
    },
    iconButton: {
      padding: 10,
      color: '#f1f1f1'
    },
    tableCellHeader: {
      background: '#343b41 !important',
      color: '#f1f1f1 !important',
      borderBottom: '2px solid #23282c !important'
    },
    tableCellBody: {
      backgroundColor: '#43484F !important',
      borderBottom: '1px solid #23282c !important',
      color: '#f1f1f1 !important'
    },
    tableFooter: {
      background: '#343b41 !important',
      color: '#f1f1f1 !important'
    },
    marginTp: {
      marginTop: '10%'
    },
    texAlign: {
      textAlign: 'center'
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
    createInput: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px',
      marginBottom: '15px',
      background: '#343b41',
      border: '1px solid #23282c',
      color: '#f1f1f1 !important'
    },
    marginBottm: {
      marginBottom: '15px'
    },
    mb10: {
      marginBottom: '5%'
    },
    space: {
      padding: '1.2rem'
    },
    mb20px: {
      marginBottom: '20px'
    },
    mb40px: {
      marginBottom: '40px'
    },
    mt10: {
      marginTop: '10%'
    },
    marginTop: {
      marginTop: '4%'
    },
    table: {
      minWidth: 650
    },
    headingFont: {
      width: '100%',
      [theme.breakpoints.down('md')]: {
        fontSize: '1.6rem'
      },
      [theme.breakpoints.between(100, undefined)]: {
        fontSize: '1.4rem'
      }
    },
    typoFont: {
      width: '100%',
      [theme.breakpoints.down('md')]: {
        fontSize: '1.3rem'
      }
    },
    typoFontsm: {
      width: '100%',
      [theme.breakpoints.down('md')]: {
        fontSize: '1.05rem'
      }
    }
  })
)

export const useSceneStyle = makeStyles({
  paper: {
    width: '60%',
    backgroundColor: '#43484F',
    color: '#f1f1f1',
    overflow: 'hidden'
  },
  sceneInfo: {
    marginTop: '5%',
    color: '#f1f1f1',
    backgroundColor: '#43484F'
  },
  sceneRoot: {
    flexGrow: 1
  },
  paperDialog: {
    background: 'rgb(58, 65, 73) !important',
    color: '#f1f1f1'
  },
  root: {
    width: '100%'
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
  container: {
    maxHeight: '73vh'
  },
  groupContainer: {
    overflowY: 'scroll',
    height: '300px'
  },
  actionStyle: {
    textDecoration: 'none',
    color: '#000',
    marginRight: '10px'
  },
  spanDange: {
    color: '#FF8C00'
  },
  spanNone: {
    color: '#808080'
  },
  spanWhite: {
    color: '#f1f1f1'
  },
  alert: {
    background: '#343b41',
    color: '#f1f1f1'
  }
})
