import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import CreateLocation from './CreateLocation'
import LocationTable from './LocationTable'

const Location = () => {
  const [openLocationModal, setOpenLocationModal] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const { t } = useTranslation()

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
          <Button
            className={styles.openModalBtn}
            type="submit"
            variant="contained"
            onClick={() => setOpenLocationModal(true)}
          >
            {t('admin:components.locationModal.createNewLocation')}
          </Button>
        </Grid>
      </Grid>
      <LocationTable className={styles.rootTableWithSearch} search={search} />
      <CreateLocation open={openLocationModal} onClose={() => setOpenLocationModal(false)} />
    </div>
  )
}

export default Location
