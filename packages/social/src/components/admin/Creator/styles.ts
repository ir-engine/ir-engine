import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useCreatorStyles = makeStyles((theme: Theme) =>
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
      margin: '4rem auto 0 auto',
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
      borderBottom: '1px solid #23282c !important',
      color: '#f1f1f1 !important'
    },
    tableFooter: {
      background: '#343b41 !important',
      color: '#f1f1f1 !important'
    },
    marginTp: {
      marginTop: '20%'
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
      marginBottom: '10%'
    },
    space: {
      padding: '1.2rem'
    },
    mb40px: {
      marginBottom: '40px'
    },
    mt10: {
      marginTop: '10%'
    },
    marginTop: {
      marginTop: '7%'
    }
  })
)

export const useCreatorStyle = makeStyles({
  paper: {
    width: '40%',
    backgroundColor: '#43484F',
    color: '#f1f1f1'
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
    maxHeight: '80vh'
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
