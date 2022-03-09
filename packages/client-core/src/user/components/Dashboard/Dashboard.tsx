import clsx from 'clsx'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'

import { ChevronLeft, ChevronRight, Menu } from '@mui/icons-material'
import { Person } from '@mui/icons-material'
import { ClickAwayListener } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuComponent from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { styled, useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import { AuthService, useAuthState } from '../../services/AuthService'
import DashboardMenuItem from './DashboardMenuItem'
import { useStylesForDashboard } from './styles'
import styles from './styles.module.scss'

interface Props {
  children?: JSX.Element
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const user = authState.user
  const isLoggedIn = authState.isLoggedIn.value
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

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
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
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

              <IconButton onClick={() => setProfileMenuOpen(true)} className={styles.profileButton} disableRipple>
                <span>{user.name.value}</span>
                <Person />
              </IconButton>
              {profileMenuOpen && (
                <>
                  <div className={styles.backdrop}></div>
                  <ClickAwayListener onClickAway={() => setProfileMenuOpen(false)}>
                    <div className={styles.profileMenuBlock}>
                      <ProfileMenu setProfileMenuOpen={setProfileMenuOpen} className={styles.profileMenuContainer} />
                    </div>
                  </ClickAwayListener>
                </>
              )}
            </div>
          </div>
        </nav>
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
