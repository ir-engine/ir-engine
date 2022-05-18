import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      height: '380',
      width: '100%',
      [theme.breakpoints.down('lg')]: {
        height: '200'
      }
    }
  })
)
