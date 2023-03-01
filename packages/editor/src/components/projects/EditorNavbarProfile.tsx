import React, { useState } from 'react'

import ProfileMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import SettingMenu from '@etherealengine/client-core/src/user/components/UserMenu/menus/SettingMenu'
import { Views } from '@etherealengine/client-core/src/user/components/UserMenu/util'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'

import { Person } from '@mui/icons-material'
import { Box, IconButton, Popover } from '@mui/material'

import styles from './styles.module.scss'

export const EditorNavbarProfile = () => {
  const authState = useAuthState()
  const user = authState.user
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()
  const [selectedMenu, setSelectedMenu] = useState(Views.Profile)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setProfileMenuOpen(true)
  }

  const handleClose = () => {
    setProfileMenuOpen(false)
    setAnchorEl(undefined)
  }

  return (
    <>
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
            <Box sx={{ width: '600px' }}>
              {selectedMenu === Views.Profile && (
                <ProfileMenu
                  isPopover
                  onClose={handleClose}
                  changeActiveMenu={(type) => setSelectedMenu(type ? type : Views.Profile)}
                />
              )}
              {selectedMenu === Views.Settings && (
                <SettingMenu isPopover changeActiveMenu={(type) => setSelectedMenu(type ? type : Views.Profile)} />
              )}
            </Box>
          </Popover>
        </>
      )}
    </>
  )
}
