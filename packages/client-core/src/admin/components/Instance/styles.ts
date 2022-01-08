import { Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useInstanceStyles = makeStyles((theme: Theme) =>
  createStyles({
    marginBottm: {
      marginBottom: '15px'
    },
    textLink: {
      marginLeft: '5px',
      textDecoration: 'none',
      color: '#ff9966'
    },
    marginTop: {
      marginTop: '30px'
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
    iconButton: {
      padding: 10,
      color: '#f1f1f1'
    }
  })
)

export const useInstanceStyle = makeStyles({
  root: {
    width: '100%'
  },
  container: {
    maxHeight: '73vh'
  },
  actionStyle: {
    textDecoration: 'none',
    color: '#000',
    marginRight: '10px'
  },
  spanDange: {
    color: '#FF8C00'
  }
})
