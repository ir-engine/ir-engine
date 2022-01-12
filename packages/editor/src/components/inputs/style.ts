import { Theme } from '@mui/material/styles'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useStyles = makeStyles((theme: Theme) => createStyles({}))

export const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    autoSelect: {
      backgroundColor: '#3A4048',
      border: '1px solid #5D646C',
      cursor: 'pointer',
      fontSize: '0.8rem',
      color: '#f2f2f2',
      padding: '0px',
      width: '130px'
    },
    inputRoot: {
      padding: '0px'
    },
    select: {
      backgroundColor: '#3A4048',
      border: '1px solid #5D646C',
      cursor: 'pointer',
      padding: '5px',
      fontSize: '0.8rem',
      color: '#f2f2f2'
    },
    paper: {
      borderRadius: '4px',
      backgroundColor: '#3F4048',
      padding: '0',
      color: 'white',
      maxHeight: '120px',
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: '5px'
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1'
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#888'
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#555'
      }
    },
    root: {
      padding: '5px',
      fontSize: '0.8rem'
    }
  })
)
