import { ChevronLeft, ChevronRight, Menu } from '@mui/icons-material'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { styled, useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import clsx from 'clsx'
import React from 'react'
import { useAuthState } from '../../services/AuthService'
import DashboardMenuItem from './DashboardMenuItem'
import { useStylesForDashboard } from './styles'

interface Props {
  children?: any
}

/**
 * Function for admin dashboard
 *
 * @param param0 children props
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  marginLeft: `-12.5rem`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  })
}))

const Dashboard = ({ children }: Props) => {
  const authState = useAuthState()
  const classes = useStylesForDashboard()
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const admin = authState.user
  const isLoggedIn = authState.isLoggedIn.value

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.header}>
          <IconButton
            color="inherit"
            style={{ color: 'white' }}
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open
            })}
            size="large"
          >
            <Menu />
          </IconButton>
          <div className={classes.appBarHeadingContainer}>
            <Typography variant="h6">Dashboard</Typography>
            {admin?.name.value && (
              <div className={classes.avatarPosition}>
                <Avatar className={classes.orange}>{admin?.name?.value.charAt(0)?.toUpperCase()}</Avatar>
                <Typography variant="h6" className={clsx(classes.marginLft, classes.appBarHeadingName)}>
                  {admin?.name.value}
                </Typography>
              </div>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })
        }}
        open={open}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose} style={{ color: '#fff' }} size="large">
            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </div>
        <DashboardMenuItem />
      </Drawer>
      <Main
        className={clsx(classes.content, {
          [classes.contentWidthDrawerOpen]: open,
          [classes.contentWidthDrawerClosed]: !open
        })}
        open={open}
      >
        <div style={{ marginLeft: '12.2rem' }}>{children}</div>
      </Main>
    </div>
  )
}

export default Dashboard
