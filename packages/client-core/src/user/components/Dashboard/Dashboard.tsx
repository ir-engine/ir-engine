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

const Dashboard = ({ children }: Props) => {
  const authState = useAuthState()
  const classes = useStylesForDashboard()
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const admin = authState.user
  const isLoggedIn = authState.isLoggedIn.value

  const handleDrawerOpen = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setOpen(open)
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
            onClick={handleDrawerOpen(true)}
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
        variant={open ? 'temporary' : 'permanent'}
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
        onClose={handleDrawerOpen(false)}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerOpen(false)} style={{ color: '#fff' }} size="large">
            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </div>
        <DashboardMenuItem />
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentWidthDrawerOpen]: open,
          [classes.contentWidthDrawerClosed]: !open
        })}
      >
        <div>{children}</div>
      </main>
    </div>
  )
}

export default Dashboard
