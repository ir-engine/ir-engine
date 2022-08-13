import React from 'react'

import { EditorNavbarProfile } from './EditorNavbarProfile'
import styles from './styles.module.scss'

export const EditorNavbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div
          className={styles.logoBlock}
          style={{ backgroundImage: 'url(/static/xrengine.png)', filter: 'invert()' }}
        ></div>
        <EditorNavbarProfile />
      </div>
    </nav>
  )
}
