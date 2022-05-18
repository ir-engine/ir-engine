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
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../services/AuthService'
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
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

const Dashboard = ({ children }: Props) => {
  const authState = useAuthState()
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const user = authState.user
  const { t } = useTranslation()

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
