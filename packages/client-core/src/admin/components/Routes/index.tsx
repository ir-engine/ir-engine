import React, { useEffect } from 'react'

import { addActionReceptor, removeActionReceptor } from '@xrengine/hyperflux'

import { AdminActiveRouteServiceReceptor } from '../../services/ActiveRouteService'
import styles from '../../styles/admin.module.scss'
import RouteTable from './RouteTable'

const Routes = () => {
  useEffect(() => {
    addActionReceptor(AdminActiveRouteServiceReceptor)
    return () => {
      removeActionReceptor(AdminActiveRouteServiceReceptor)
    }
  }, [])

  return (
    <div className={styles.rootTable}>
      <RouteTable />
    </div>
  )
}

export default Routes
