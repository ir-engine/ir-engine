import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import PartyDrawer, { PartyDrawerMode } from './PartyDrawer'
import PartyTable from './PartyTable'

const Party = () => {
  const [openPartyDrawer, setOpenPartyDrawer] = useState(false)
  const [search, setSearch] = useState('')
  const { t } = useTranslation()

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={12} sm={8}>
          <Search text="party" handleChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            className={styles.openModalBtn}
            type="submit"
            variant="contained"
            onClick={() => setOpenPartyDrawer(true)}
          >
            {t('admin:components.party.createParty')}
          </Button>
        </Grid>
      </Grid>

      <PartyTable className={styles.rootTableWithSearch} search={search} />

      <PartyDrawer open={openPartyDrawer} mode={PartyDrawerMode.Create} onClose={() => setOpenPartyDrawer(false)} />
    </div>
  )
}

export default Party
