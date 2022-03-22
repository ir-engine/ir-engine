import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import CreateLocation from './CreateLocation'
import LocationTable from './LocationTable'

const Location = () => {
  const [locationModelOpen, setLocationModelOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const { t } = useTranslation()

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
      <Grid container spacing={3} className={styles.mb10px}>
        <Grid item xs={9}>
          <Search text="location" handleChange={handleChange} />
        </Grid>
        <Grid item xs={3}>
          <Button className={styles.openModalBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            {t('admin:components.locationModel.createNewLocation')}
          </Button>
        </Grid>
      </Grid>
      <div className={styles.rootTableWithSearch}>
        <LocationTable search={search} />
      </div>
      <CreateLocation open={locationModelOpen} handleClose={openModalCreate} closeViewModel={closeViewModel} />
    </div>
  )
}

export default Location
