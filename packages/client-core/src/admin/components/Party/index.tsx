import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import CreateParty from './CreateParty'
import PartyTable from './PartyTable'

const Party = () => {
  const [partyModelOpen, setPartyModelOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const { t } = useTranslation()
  const openModalCreate = () => {
    setPartyModelOpen(true)
  }

  const handleCreatePartyClose = () => {
    setPartyModelOpen(false)
  }
  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <Grid container spacing={3} className={styles.mb10px}>
        <Grid item xs={9}>
          <Search text="party" handleChange={handleChange} />
        </Grid>
        <Grid item xs={3}>
          <Button className={styles.openModalBtn} type="submit" variant="contained" onClick={() => openModalCreate()}>
            {t('admin:components.party.createNewParty')}
          </Button>
        </Grid>
      </Grid>
      <div className={styles.rootTableWithSearch}>
        <PartyTable search={search} />
      </div>
      <CreateParty open={partyModelOpen} handleClose={handleCreatePartyClose} />
    </div>
  )
}

export default Party
