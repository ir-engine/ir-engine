import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useStyles = makeStyles((theme: Theme) => createStyles({}))

export const useStyle = makeStyles((theme: Theme) => {
  console.debug(theme)
  return createStyles({
    popper: {
      fontSize: '0.8rem'
    },
    input: {
      fontSize: '0.8rem',
      color: '#f2f2f2'
    },
    autoSelectPaper: {
      borderRadius: '4px',
      backgroundColor: '#282C31',
      padding: '-9px',
      color: 'white',
      maxHeight: '120px',
      overflow: 'auto',
      fontSize: '0.8rem'
    },
    autoSelect: {
      backgroundColor: '#3A4048',
      borderRadius: '4px',
      cursor: 'pointer',
      color: '#f2f2f2',
      fontSize: '0.8rem',
      padding: '0px !important'
    },
    select: {
      backgroundColor: theme.inputBackground,
      borderRadius: '4px',
      borderWidth: 0,
      cursor: 'pointer',
      padding: '2px 7px',
      fontSize: '12px',
      color: '#f2f2f2'
    },
    paper: {
      borderRadius: '4px',
      backgroundColor: '#282C31',
      padding: '0',
      color: 'white',
      maxHeight: '120px',
      overflow: 'auto'
    },
    root: {
      padding: '5px',
      fontSize: '0.8rem',
      '&:hover': {
        background: '#006EFF'
      }
    },
    icon: {
      color: '#f1f1f1'
    },
    txtRoot: {
      padding: '5px 8px 2px 12px'
    }
  })
})
