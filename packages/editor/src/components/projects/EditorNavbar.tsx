import React, { useState } from 'react'

import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

import { Person } from '@mui/icons-material'
import { IconButton, Popover } from '@mui/material'

import styles from './styles.module.scss'

export const EditorNavbar = () => {
  const authState = useAuthState()
  const user = authState.user
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setProfileMenuOpen(true)
  }

  const handleClose = () => {
    setProfileMenuOpen(false)
    setAnchorEl(undefined)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div
          className={styles.logoBlock}
          style={{ backgroundImage: 'url(/static/xrengine.png)', filter: 'invert()' }}
        ></div>
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
              <ProfileMenu isPopover onClose={handleClose} />
            </Popover>
          </>
        )}
      </div>
    </nav>
  )
}
