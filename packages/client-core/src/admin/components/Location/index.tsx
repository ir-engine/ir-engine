import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import CreateLocation from './CreateLocation'
import LocationTable from './LocationTable'

const Location = () => {
  const [locationModalOpen, setLocationModalOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const { t } = useTranslation()

  const openModalCreate = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setLocationModalOpen(open)
  }
  const closeViewModal = (open: boolean) => {
    setLocationModalOpen(open)
  }

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={12} sm={8}>
          <Search text="location" handleChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button className={styles.openModalBtn} type="submit" variant="contained" onClick={openModalCreate(true)}>
            {t('admin:components.locationModal.createNewLocation')}
          </Button>
        </Grid>
      </Grid>
      <div className={styles.rootTableWithSearch}>
        <LocationTable search={search} />
      </div>
      <CreateLocation open={locationModalOpen} handleClose={openModalCreate} closeViewModal={closeViewModal} />
    </div>
  )
}

export default Location
