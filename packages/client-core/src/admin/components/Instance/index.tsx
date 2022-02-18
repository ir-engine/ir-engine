import React, { useEffect } from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Search from '../../common/Search'
import { useStyles } from '../../styles/ui'
import InstanceTable from './InstanceTable'
import PatchGameserver from './PatchGameserver'
import AlertMessage from '../../common/AlertMessage'
import { useGameserverState } from '../../services/GameserverService'

const Instance = () => {
  const classes = useStyles()
  const [search, setSearch] = React.useState('')
  const [patchGameserverOpen, setPatchGameserverOpen] = React.useState(false)
  const [openAlert, setOpenAlert] = React.useState(false)
  const gameserverState = useGameserverState()
  const { patch } = gameserverState.value

  useEffect(() => {
    if (patch) {
      setOpenAlert(true)
    }
  }, [gameserverState.patch])

  const openPatchModal = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setPatchGameserverOpen(open)
  }

  const closePatchModal = (open: boolean) => {
    setPatchGameserverOpen(open)
  }

  const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpenAlert(false)
  }

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <React.Fragment>
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={9}>
          <Search text="instance" handleChange={handleChange} />
        </Grid>
        <Grid item xs={3}>
          <Button className={classes.createBtn} type="submit" variant="contained" onClick={openPatchModal(true)}>
            Patch Gameserver
          </Button>
        </Grid>
      </Grid>
      <div className={classes.rootTableWithSearch}>
        <InstanceTable search={search} />
      </div>
      {patchGameserverOpen && <PatchGameserver open handleClose={openPatchModal} closeViewModel={closePatchModal} />}
      {patch && openAlert && (
        <AlertMessage
          open
          handleClose={handleCloseAlert}
          severity={patch.status === true ? 'success' : 'warning'}
          message={patch.message}
        />
      )}
    </React.Fragment>
  )
}

export default Instance
