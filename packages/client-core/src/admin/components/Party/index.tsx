import React from 'react'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Search from '../../common/Search'
import PartyTable from './PartyTable'
import CreateParty from './CreateParty'
import { useStyles } from '../../styles/ui'

const Party = () => {
  const classes = useStyles()
  const [partyModelOpen, setPartyModelOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

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
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={9}>
          <Search text="party" handleChange={handleChange} />
        </Grid>
        <Grid item xs={3}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={() => openModalCreate()}>
            Create New Party
          </Button>
        </Grid>
      </Grid>
      <div className={classes.rootTableWithSearch}>
        <PartyTable search={search} />
      </div>
      <CreateParty open={partyModelOpen} handleClose={handleCreatePartyClose} />
    </div>
  )
}

export default Party
