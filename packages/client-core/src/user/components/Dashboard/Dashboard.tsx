import React from 'react'
import clsx from 'clsx'
import { useTheme } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import { ChevronLeft, ChevronRight, Menu } from '@material-ui/icons'
import Avatar from '@material-ui/core/Avatar'
import { useAuthState } from '../../state/AuthState'

import { useStylesForDashboard } from './styles'
import SideMenu from './SideMenuItem'

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

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            style={{ color: 'white' }}
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open
            })}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6">Dashboard</Typography>
          {admin?.name.value && (
            <div className={classes.avatarPosition}>
              <Avatar className={classes.orange}>{admin?.name?.value.charAt(0)?.toUpperCase()}</Avatar>
              <Typography variant="h6" className={classes.marginLft}>
                {admin?.name.value}
              </Typography>
            </div>
          )}
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
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose} style={{ color: '#fff' }}>
            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </div>
        <SideMenu />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <div>{children}</div>
      </main>
    </div>
  )
}

export default Dashboard
