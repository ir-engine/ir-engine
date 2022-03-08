import clsx from 'clsx'
import React, { useState } from 'react'
<<<<<<< HEAD
import { useTranslation } from 'react-i18next'

import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
=======
>>>>>>> d96cd61bb (implemet logout for admin system)

import { ChevronLeft, ChevronRight, Menu } from '@mui/icons-material'
import { Person } from '@mui/icons-material'
import { ClickAwayListener } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
<<<<<<< HEAD
import { useTheme } from '@mui/material/styles'
=======
import MenuComponent from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { styled, useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
>>>>>>> d96cd61bb (implemet logout for admin system)
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../services/AuthService'
import DashboardMenuItem from './DashboardMenuItem'
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
  const theme = useTheme()
  const [open, setOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const user = authState.user
<<<<<<< HEAD
=======
  const isLoggedIn = authState.isLoggedIn.value
<<<<<<< HEAD
>>>>>>> implemet logout for admin system
  const { t } = useTranslation()
=======
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
>>>>>>> d96cd61bb (implemet logout for admin system)

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
<<<<<<< HEAD
      <AppBar position="fixed" className={styles.appBar}>
=======
      <AppBar position="fixed" className={classes.appBar}>
<<<<<<< HEAD
>>>>>>> implemet logout for admin system
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <IconButton
              color="inherit"
              style={{ color: 'white' }}
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
=======
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
              <IconButton
                className={classes.avatarPosition}
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
                onClick={handleClickMenu}
              >
                <Avatar className={classes.orange}>{admin?.name?.value.charAt(0)?.toUpperCase()}</Avatar>
                <Typography variant="h6" className={clsx(classes.marginLft, classes.appBarHeadingName)}>
                  {admin?.name.value}
                </Typography>
              </IconButton>
            )}
          </div>
        </Toolbar>

        <MenuComponent
          id="basic-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button'
          }}
        >
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </MenuComponent>
>>>>>>> d96cd61bb (implemet logout for admin system)
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
          <IconButton onClick={handleDrawerOpen(false)} style={{ color: '#fff' }} size="large">
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
