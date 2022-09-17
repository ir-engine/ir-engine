import clsx from 'clsx'
import React, { useState } from 'react'

import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'

import { ChevronLeft, ChevronRight, Menu } from '@mui/icons-material'
import { Person } from '@mui/icons-material'
import { Popover } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../services/AuthService'
import SettingMenu from '../UserMenu/menus/SettingMenu'
import { Views } from '../UserMenu/util'
import DashboardMenuItem from './DashboardMenuItem'
import styles from './index.module.scss'

interface Props {
  children?: JSX.Element
}

/**
 * Function for admin dashboard
 *
 * @param param0 children props
 * @returns @ReactDomElements
 */

const Dashboard = ({ children }: Props) => {
  const authState = useAuthState()
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()
  const [open, setOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(Views.Profile)
  const user = authState.user

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setProfileMenuOpen(true)
  }

  const handleClose = () => {
    setProfileMenuOpen(false)
    setAnchorEl(undefined)
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
    <div>
      <CssBaseline />
      <AppBar position="fixed" className={styles.appBar}>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen(true)}
              edge="start"
              className={clsx(styles.menuButton, {
                [styles.hide]: open
              })}
              size="large"
            >
              <Menu />
            </IconButton>
            <div className={styles.appBarHeadingContainer}>
              <Typography variant="h6">Dashboard</Typography>

              <IconButton onClick={handleClick} className={styles.profileButton} disableRipple>
                <span>{user.name.value}</span>
                <Person />
              </IconButton>
              {profileMenuOpen && (
                <>
                  <div className={styles.backdrop}></div>
                  <Popover
                    open
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left'
                    }}
                    classes={{ paper: styles.profilePaper }}
                    onClose={handleClose}
                  >
                    {selectedMenu === Views.Profile && (
                      <ProfileMenu
                        isPopover
                        onClose={handleClose}
                        changeActiveMenu={(type) => setSelectedMenu(type ? type : Views.Profile)}
                      />
                    )}
                    {selectedMenu === Views.Settings && (
                      <SettingMenu
                        isPopover
                        changeActiveMenu={(type) => setSelectedMenu(type ? type : Views.Profile)}
                      />
                    )}
                  </Popover>
                </>
              )}
            </div>
          </div>
        </nav>
      </AppBar>
      <Drawer
        variant={open ? 'temporary' : 'permanent'}
        className={clsx(styles.drawer, {
          [styles.drawerOpen]: open,
          [styles.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [styles.drawerOpen]: open,
            [styles.drawerClose]: !open
          })
        }}
        open={open}
        onClose={handleDrawerOpen(false)}
      >
        <div className={styles.toolbar}>
          <IconButton onClick={handleDrawerOpen(false)} style={{ color: 'var(--iconButtonColor)' }} size="large">
            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </div>
        <DashboardMenuItem />
      </Drawer>
      <main
        className={clsx(styles.content, {
          [styles.contentWidthDrawerOpen]: open,
          [styles.contentWidthDrawerClosed]: !open
        })}
      >
        <div>{children}</div>
      </main>
    </div>
  )
}

export default Dashboard
