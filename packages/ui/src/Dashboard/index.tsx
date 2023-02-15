import clsx from 'clsx'
import React, { useState } from 'react'

import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
// import { useTheme } from '@mui/material/styles'

// import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import SettingMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { Views } from '@xrengine/client-core/src/user/components/UserMenu/util'
import AppBar from '@xrengine/ui/src/AppBar'
import Box from '@xrengine/ui/src/Box'
import Drawer from '@xrengine/ui/src/Drawer'
import Icon from '@xrengine/ui/src/Icon'
import IconButton from '@xrengine/ui/src/IconButton'
import Popover from '@xrengine/ui/src/Popover'
import Typography from '@xrengine/ui/src/Typography'

import CssBaseline from '@mui/material/CssBaseline'

import DashboardMenuItem from '../DashboardMenuItem'
import styles from './index.module.scss'

/**
 * Function for admin dashboard
 *
 * @param param0 children props
 * @returns @ReactDomElements
 */

const Dashboard = ({ children }) => {
  // const authState = useAuthState()
  // const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()
  const [open, setOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(Views.Profile)
  // const user = authState.user

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
              <Icon type="Menu" />
            </IconButton>
            <div className={styles.appBarHeadingContainer}>
              <Typography variant="h6">Dashboard</Typography>

              <IconButton onClick={handleClick} className={styles.profileButton} disableRipple>
                {/* <span>{user.name.value}</span> */}
                <Icon type="Person" />
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
                    <Box sx={{ width: '600px' }}>
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
                    </Box>
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
            {/* <Icon type={theme.direction === 'rtl' ? 'ChevronRight' : 'ChevronLeft'} /> */}
            <Icon type={'ChevronLeft'} />
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
        {children}
      </main>
    </div>
  )
}

Dashboard.displayName = 'Dashboard'

Dashboard.defaultProps = {
  children: <div>hello</div>,
  user: {
    name: {
      value: 'default name'
    }
  }
}

export default Dashboard
