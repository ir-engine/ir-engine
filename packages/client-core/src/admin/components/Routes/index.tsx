import React from 'react'
import { useRouteStyles } from './styles'
import RouteTable from './RouteTable'

const Routes = () => {
  const classes = useRouteStyles()
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
    <div>
      <div className={classes.rootTable}>
        <RouteTable />
      </div>
    </div>
  )
}

export default Routes
