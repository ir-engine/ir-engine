import React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { styled, alpha } from '@mui/material/styles'
import Menu, { MenuProps } from '@mui/material/Menu'

export const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    background: '#1f252d',
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0'
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.grey[300],
        marginRight: theme.spacing(1.5)
      },
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)
      }
    }
  }
}))

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rightRoot: {
      backgroundColor: '#1f252d',
      height: '100vh'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      padding: '5px',
      backgroundColor: '#12191D',
      justifyContent: 'flex-end'
    },
    alert: {
      background: '#343b41',
      color: '#f1f1f1'
    },
    spanNone: {
      color: '#808080'
    },
    btnConfirm: {
      border: '1px solid #FF8C00',
      color: '#808080'
    },
    spanWhite: {
      color: '#f1f1f1'
    },
    spanDange: {
      color: '#FF8C00'
    },
    paperDialog: {
      color: '#f1f1f1'
    },
    saveBtn: {
      background: '#43484F !important',
      color: '#FF8C00 !important',
      boxShadow:
        '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important',
      '&:hover': {
        background: '#c2c2c2 !important'
      }
    },
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: '75vw'
    },
    firstMessagePlaceholder: {
      fontSize: '3em',
      margin: 'auto'
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1
    },
    inputEdit: {
      borderRadius: '5px',
      background: '#43484F',
      margin: '5px 0px 10px 40px',
      width: '95%',
      outline: 'none'
    },
    iconButton: {
      padding: 10
    },
    divider: {
      height: 28,
      margin: 4
    },
    listText: {
      flexGrow: 1,
      backgroundColor: 'transparent'
    },
    messageContainer: {
      padding: '10px 0',
      overflowY: 'auto',
      height: '85vh'
    },
    whiteIcon: {
      color: '#f1f1f1'
    },
    listBtn: {
      backgroundColor: '#1f252d',
      color: '#fff',
      '&:hover': {
        background: 'rgba(0,0,0,0.9)'
      }
    },
    noBorder: {
      border: 'none'
    }
  })
)

export const useStyle = makeStyles({})
