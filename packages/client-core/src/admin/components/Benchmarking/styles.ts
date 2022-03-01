import { Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    heading: {
      color: '#C0C0C0'
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: '#C0C0C0'
    }
  })
)
