import React from 'react'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import LocationTable from './LocationTable'
import Search from './SearchLocation'
import CreateLocation from './createLocation'
import { useLocationStyles } from './styles'

const Location = () => {
  const classes = useLocationStyles()
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
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={9}>
          <Search />
        </Grid>
        <Grid item xs={3}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            Create New Location
          </Button>
        </Grid>
      </Grid>
      <div className={classes.rootTable}>
        <LocationTable />
      </div>
      <CreateLocation open={locationModelOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
    </div>
  )
}

export default Location
