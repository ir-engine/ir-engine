import clsx from 'clsx'
import React, { useState } from 'react'

import ProfileMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import SettingMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { Views } from '@etherealengine/client-core/src/user/components/UserMenu/util'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import AppBar from '@etherealengine/ui/src/AppBar'
import Box from '@etherealengine/ui/src/Box'
import Drawer from '@etherealengine/ui/src/Drawer'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import Popover from '@etherealengine/ui/src/Popover'
import Typography from '@etherealengine/ui/src/Typography'

import { useTheme } from '@mui/material/styles'

import DashboardMenuItem from '../DashboardMenuItem'
import styles from './index.module.scss'

/**
 * Function for admin dashboard
 *
 * @param param0 children props
 * @returns @ReactDomElements
 */

const Dashboard = ({ children }) => {
  const authState = useAuthState()
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()
  const [open, setOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(Views.Profile)
  const { user } = authState

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
    <div style={{ pointerEvents: 'auto' }}>
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
              icon={<Icon type="Menu" />}
            />
            <div className={styles.appBarHeadingContainer}>
              <Typography variant="h6">Dashboard</Typography>

              <IconButton
                onClick={handleClick}
                className={styles.profileButton}
                disableRipple
                icon={
                  <>
                    <span>{user.name.value}</span>
                    <Icon type="Person" />
                  </>
                }
              />
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
          <IconButton
            onClick={handleDrawerOpen(false)}
            style={{ color: 'var(--iconButtonColor)' }}
            size="large"
            icon={<Icon type={theme.direction === 'rtl' ? 'ChevronRight' : 'ChevronLeft'} />}
          />
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
