import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    paperDialog: {
      background: 'rgb(58, 65, 73) !important',
      color: '#f1f1f1'
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
    rootMenu: {
      background: '#000000',
      color: '#fff'
    },
    selected: {
      background: '#006EFF'
    },
    itemRoot: {
      fontSize: '0.8rem',
      '&:hover': {
        background: '#006EFF'
      }
    },
    inputContainer: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px',
      marginBottom: '15px',
      background: '#343b41',
      border: '1px solid #23282c',
      color: '#f1f1f1 !important'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      color: '#f1f1f1'
    }
  })
)
