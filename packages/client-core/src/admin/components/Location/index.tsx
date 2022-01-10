import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Search from '../../common/Search'
import { useLocationStyles } from './styles'
import LocationTable from './LocationTable'
import CreateLocation from './createLocation'

const Location = () => {
  const classes = useLocationStyles()
  const [locationModelOpen, setLocationModelOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

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

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={9}>
          <Search text="location" handleChange={handleChange} />
        </Grid>
        <Grid item xs={3}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            Create New Location
          </Button>
        </Grid>
      </Grid>
      <div className={classes.rootTable}>
        <LocationTable search={search} />
      </div>
      <CreateLocation open={locationModelOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
    </div>
  )
}

export default Location
