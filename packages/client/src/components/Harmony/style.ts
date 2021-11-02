import makeStyles from '@mui/styles/makeStyles'
import createStyles from '@mui/styles/createStyles'
import { Theme } from '@mui/material/styles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    whiteIcon: {
      color: '#f1f1f1'
    }
  })
)

export const useStyle = makeStyles({
  paper: {
    padding: '0px',
    overflow: 'hidden',
    background: 'rgb(21, 23, 27)'
  }
})
