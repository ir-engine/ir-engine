import React, { useState } from 'react'
import { Person } from '@mui/icons-material'
import { ClickAwayListener, IconButton } from '@mui/material'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import styles from './styles.module.scss'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

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
