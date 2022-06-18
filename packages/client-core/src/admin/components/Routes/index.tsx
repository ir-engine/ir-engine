import React, { useEffect } from 'react'

import { addActionReceptor, removeActionReceptor } from '@xrengine/hyperflux'

import { AdminActiveRouteServiceReceptor } from '../../services/ActiveRouteService'
import { AdminRouteServiceReceptor } from '../../services/RouteService'
import styles from '../../styles/admin.module.scss'
import RouteTable from './RouteTable'

const Routes = () => {
  useEffect(() => {
    addActionReceptor(AdminRouteServiceReceptor)
    addActionReceptor(AdminActiveRouteServiceReceptor)
    return () => {
      removeActionReceptor(AdminRouteServiceReceptor)
      removeActionReceptor(AdminActiveRouteServiceReceptor)
    }
  }, [])

  return <RouteTable className={styles.rootTable} />
}

export default Routes
