import React from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Search from '../../common/Search'
import { useGameserverState } from '../../services/GameserverService'
import styles from '../../styles/admin.module.scss'
import { useStyles } from '../../styles/ui'
import InstanceTable from './InstanceTable'
import PatchGameserver from './PatchGameserver'

const Instance = () => {
  const classes = useStyles()
  const [patchGameserverOpen, setPatchGameserverOpen] = React.useState(false)
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
      <PatchGameserver open={patchGameserverOpen} handleClose={openPatchModal} closeViewModel={closePatchModal} />
    </React.Fragment>
  )
}

export default Instance
