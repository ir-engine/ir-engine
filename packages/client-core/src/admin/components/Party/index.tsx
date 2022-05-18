import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import CreateParty from './CreateParty'
import PartyTable from './PartyTable'

const Party = () => {
  const [partyModalOpen, setPartyModalOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const { t } = useTranslation()
  const openModalCreate = () => {
    setPartyModalOpen(true)
  }

  const handleCreatePartyClose = () => {
    setPartyModalOpen(false)
  }
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
          <Button className={styles.openModalBtn} type="submit" variant="contained" onClick={() => openModalCreate()}>
            {t('admin:components.party.createNewParty')}
          </Button>
        </Grid>
      </Grid>
      <div className={styles.rootTableWithSearch}>
        <PartyTable search={search} />
      </div>
      <CreateParty open={partyModalOpen} handleClose={handleCreatePartyClose} />
    </div>
  )
}

export default Party
