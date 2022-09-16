import React from 'react'

import { EditorNavbarProfile } from './EditorNavbarProfile'
import styles from './styles.module.scss'

export const EditorNavbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logoBlock} style={{ backgroundImage: 'url(/static/etherealengine.png)' }}></div>
        <EditorNavbarProfile />
      </div>
    </nav>
  )
}
