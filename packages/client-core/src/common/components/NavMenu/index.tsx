import React from 'react'
import NavUserWidget from '../NavUserWidget'
import AppBar from '@mui/material/AppBar'
import styles from './NavMenu.module.scss'

interface Props {
  login?: boolean
}

export const NavMenu = (props: Props): any => {
  const { login } = props
  return (
    <AppBar className={styles.appbar}>
      <NavUserWidget login={login} />
    </AppBar>
  )
}

export default NavMenu
