import React, { useState } from 'react'

import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

import { Person } from '@mui/icons-material'
import { ClickAwayListener, IconButton } from '@mui/material'

import styles from './styles.module.scss'

export const EditorNavbar = () => {
  const authState = useAuthState()
  const user = authState.user
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div
          className={styles.logoBlock}
          style={{ backgroundImage: 'url(/static/xrengine.png)', filter: 'invert()' }}
        ></div>
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
    </nav>
  )
}
