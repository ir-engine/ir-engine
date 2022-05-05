import React from 'react'

import styles from '../../styles/admin.module.scss'
import RouteTable from './RouteTable'

const Routes = () => {
  return (
    <div className={styles.rootTable}>
      <RouteTable />
    </div>
  )
}

export default Routes
