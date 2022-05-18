import { Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      background: '#666666',
      display: 'flex',
      alignItems: 'center',
      width: 400
    },
    selectPaper: {
      background: '#343b41',
      color: '#f1f1f1'
    },
    rootBtn: {
      fontSize: '13px',
      width: 'auto',
      fontWeight: 'bold',
      background: '#5f5ff1',
      padding: '6px 28px'
    },
    btnContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '10px'
    },
    input: {
      fontSize: '14px'
    },
    tabRoot: {
      minHeight: '20px',
      color: '#ccc'
    },
    selected: {
      background: '#f1f1f1'
    },
    color: {
      color: '#f1f1f1'
    },
    paper2: {
      background: '#666666',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: '6px 0px'
    }
  })
)
