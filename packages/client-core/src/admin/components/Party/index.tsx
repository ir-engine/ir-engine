import React from 'react'
import Grid from '@material-ui/core/Grid'
import styles from '../Admin.module.scss'
import Button from '@material-ui/core/Button'
import Search from '../Search'
import { makeStyles, Theme } from '@material-ui/core/styles'
import PartyTable from './PartyTable'
import CreateParty from './CreateParty'

const useStyles = makeStyles((theme: Theme) => ({
  marginBottom: {
    marginBottom: '10px'
  }
}))

const Party = () => {
  const classes = useStyles()
  const [partyModelOpen, setPartyModelOpen] = React.useState(false)

  const openModalCreate = () => {
    setPartyModelOpen(true)
  }

  const handleCreatePartyClose = () => {
    setPartyModelOpen(false)
  }

  return (
    <div>
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={9}>
          <Search typeName="party" />
        </Grid>
        <Grid item xs={3}>
          <Button
            className={styles.createLocation}
            type="submit"
            variant="contained"
            color="primary"
            onClick={openModalCreate}
          >
            Create New Party
          </Button>
        </Grid>
      </Grid>
      <PartyTable />

      <CreateParty open={partyModelOpen} handleClose={handleCreatePartyClose} />
    </div>
  )
}

export default Party
