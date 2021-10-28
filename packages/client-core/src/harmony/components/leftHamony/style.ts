import { Theme } from '@mui/material/styles'

import makeStyles from '@mui/styles/makeStyles'
import createStyles from '@mui/styles/createStyles'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
// import { createTheme } from "@mui/material/styles"

// const theme = createTheme();

export const useUserStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: '#43484F'
    },
    createInput: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px',
      marginBottom: '3rem',
      background: '#343b41',
      border: '1px solid #23282c',
      color: '#f1f1f1 !important'
    },
    inline: {
      display: 'inline'
    },
    select: {
      color: '#f1f1f1 !important'
    },
    paperRoot: {
      flexGrow: 1
    },
    formControl: {
      minWidth: 120
    },
    selectEmpty: {
      marginTop: theme.spacing(2)
    },
    saveBtn: {
      marginLeft: 'auto',
      background: '#43484F !important',
      color: '#fff !important',
      width: '150px',
      marginRight: '25px',
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important',
      [theme.breakpoints.down('sm')]: {
        width: '120px'
      },
      [theme.breakpoints.between(100, 335)]: {
        width: '80px'
      }
    },
    container: {
      marginTop: '30%',
      background: 'transparent',
      color: '#f1f1f1'
    },
    texAlign: {
      textAlign: 'center',
      background: 'transparent',
      display: 'block'
    },
    redBorder: {
      border: '1px solid red',
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center #343b41',
      marginTop: '10px',
      marginBottom: '15px',
      background: '#343b41',
      color: '#f1f1f1 !important'
    },
    listBtn: {
      backgroundColor: '#43484F',
      color: '#fff',
      '&:hover': {
        background: 'rgba(0,0,0,0.9)'
      }
    },
    listText: {
      backgroundColor: '#43484F',
      width: '100%',
      '&:hover': {
        background: 'rgba(0,0,0,0.9)'
      }
    }
  })
)

export const useStyle = makeStyles({
  selectPaper: {
    background: '#343b41',
    color: '#f1f1f1 !important'
  },
  paper: {
    width: '45rem',
    padding: '0px',
    background: '#43484F !important',
    overflow: 'hidden'
  }
})

export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2px 20px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  background: '#343b41'
}))

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  color: '#f1f1f1'
}))

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: 10,
  color: '#f1f1f1'
}))

export const CreateInput = styled(Paper)(({ theme }) => ({
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  marginTop: '10px',
  marginBottom: '3rem',
  background: '#343b41',
  border: '1px solid #23282c',
  color: '#f1f1f1 !important'
}))
