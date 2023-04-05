import { useHookstate } from '@hookstate/core'
import React from 'react'

import { PopupMenuServices } from '@etherealengine/client-core/src/user/components/UserMenu/PopupMenuService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { UserMenus } from '@etherealengine/client-core/src/user/UserUISystem'
import { getMutableState } from '@etherealengine/hyperflux'

import { Person } from '@mui/icons-material'
import { IconButton } from '@mui/material'

import styles from './styles.module.scss'

export const EditorNavbarProfile = () => {
  const name = useHookstate(getMutableState(AuthState).user.name)

  const handleClick = () => {
    PopupMenuServices.showPopupMenu(UserMenus.Profile)
  }

  return (
    <>
      <IconButton onClick={handleClick} className={styles.profileButton} disableRipple>
        <span>{name.value}</span>
        <Person />
      </IconButton>
    </>
  )
}
