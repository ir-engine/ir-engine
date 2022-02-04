import React from 'react'
import { useStyles } from '../../styles/ui'
import RouteTable from './RouteTable'

const Routes = () => {
  const classes = useStyles()
  const [locationModelOpen, setLocationModelOpen] = React.useState(false)

  const openModalCreate = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setLocationModelOpen(open)
  }
  const closeViewModel = (open: boolean) => {
    setLocationModelOpen(open)
  }

  return (
    <div className={classes.rootTable}>
      <RouteTable />
    </div>
  )
}

export default Routes
