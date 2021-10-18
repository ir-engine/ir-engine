import React from 'react'
import Grid from '@material-ui/core/Grid'
import styles from '../Admin.module.scss'
import Button from '@material-ui/core/Button'
import Search from './SearchParty'
import { makeStyles, Theme } from '@material-ui/core/styles'
import PartyTable from './PartyTable'
import CreateParty from './CreateParty'
import { usePartyStyles } from './style'

const useStyles = makeStyles((theme: Theme) => ({
  marginBottom: {
    marginBottom: '10px'
  },
  createBtn: {
    height: '50px',
    margin: 'auto 5px',
    width: '100%',
    background: 'rgb(58, 65, 73)',
    color: '#f1f1f1 !important'
  }
}))

const Party = () => {
  const classes = useStyles()
  const classx = usePartyStyles()
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
          <Search />
        </Grid>
        <Grid item xs={3}>
          <Button
            className={`${classx.typoFont} ${classes.createBtn}`}
            type="submit"
            variant="contained"
            onClick={() => openModalCreate()}
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
