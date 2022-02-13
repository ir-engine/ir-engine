import React from 'react'
import { useStyles } from '../../styles/ui'
import RouteTable from './RouteTable'

const Routes = () => {
  const classes = useStyles()

  return (
    <div className={classes.rootTable}>
      <RouteTable />
    </div>
  )
}

export default Routes
