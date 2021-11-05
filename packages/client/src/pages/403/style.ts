import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    Btn: {
      height: '50px',
      margin: 'auto 5px',
      width: '100%',
      background: 'rgb(58, 65, 73)',
      color: '#f1f1f1 !important',
      border: 'solid #f1f1f1 2px'
    },
    notFound: {
      position: 'absolute',
      left: '50%',
      top: '35%',
      transform: 'translate(-50%, 50%)',
      maxWidth: '460px',
      width: '100%',
      textAlign: 'center',
      lineHeight: '1.4'
    },
    typo: {
      fontFamily: 'inherit',
      color: '#c9c9c9',
      fontSize: '18px',
      fontWeight: 'normal',
      marginTop: '0',
      marginBottom: '40px'
    }
  })
)

export const useStyle = makeStyles({
  paper: {
    width: '100%',
    backgroundColor: '#43484F',
    color: '#f1f1f1',
    position: 'relative',
    height: '100vh'
  }
})
