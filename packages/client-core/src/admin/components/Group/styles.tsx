import { Theme } from '@mui/material/styles'

import makeStyles from '@mui/styles/makeStyles'
import createStyles from '@mui/styles/createStyles'

export const useGroupStyles = makeStyles((theme: Theme) =>
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
    paper: {
      maxWidth: '80%',
      minWidth: '40%',
      backgroundColor: '#43484F ',
      color: '#f1f1f1',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },
    texAlign: {
      textAlign: 'center'
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
    saveBtn: {
      marginLeft: 'auto',
      marginRight: '25px',
      background: '#43484F !important',
      color: '#fff !important',
      width: '150px',
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important'
    },
    marginTp: {
      marginTop: '20%'
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
    actionStyle: {
      textDecoration: 'none',
      color: '#000',
      marginRight: '10px'
    },
    spanNone: {
      color: '#808080'
    },
    spanWhite: {
      color: '#f1f1f1'
    },
    spanDange: {
      color: '#FF8C00'
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
    selector: {
      width: '100%'
    },
    select: {
      color: '#f1f1f1 !important'
    },
    mt20: {
      marginTop: '20%'
    },
    mt10: {
      marginTop: '10%'
    },
    mb10: {
      marginBottom: '10%'
    },
    mb20px: {
      marginBottom: '20px'
    },
    marginTop: {
      marginTop: '4%'
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
    root: {
      width: '100%',
      backgroundColor: '#43484F'
    },
    flex: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '4%'
    },
    alert: {
      background: '#343b41',
      color: '#f1f1f1'
    }
  })
)

export const useGroupStyle = makeStyles({
  root: {
    width: '100%'
  },
  paper: {
    width: '50%',
    backgroundColor: '#43484F',
    color: '#f1f1f1'
  },
  container: {
    maxHeight: '80vh'
  },
  selectPaper: {
    background: '#343b41',
    color: '#f1f1f1'
  }
})
