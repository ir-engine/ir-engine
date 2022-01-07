import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Search from './SearchLocation'
import { useLocationStyles } from './styles'
import LocationTable from './LocationTable'
import CreateLocation from './createLocation'

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
    <div style={{ pointerEvents: 'auto' }}>
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
