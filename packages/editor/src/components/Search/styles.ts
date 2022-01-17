import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    searchRoot: {
      position: 'absolute',
      left: '16rem',
      width: '80px',
      zIndex: '10',
      display: 'flex',
      alignItems: 'center',
      background: 'transparent',
      border: 'none',
      boxShadow: 'none'
    },
    input: {
      color: '#ffffff',
      fontSize: '0.8rem'
    },
    iconButton: {
      width: '20px',
      height: '20px',
      color: '#ffffff',
      marginLeft: '4px'
    },
    searchRootB: {
      position: 'absolute',
      left: '7rem',
      top: '-2px',
      width: '80px',
      zIndex: '10',
      display: 'flex',
      alignItems: 'center',
      background: 'transparent',
      border: 'none',
      boxShadow: 'none'
    }
  })
)
