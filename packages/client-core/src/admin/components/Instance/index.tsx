import React, { useEffect } from 'react'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import AlertMessage from '../../common/AlertMessage'
import Search from '../../common/Search'
import { useGameserverState } from '../../services/GameserverService'
import styles from '../../styles/admin.module.scss'
import InstanceTable from './InstanceTable'
import PatchGameserver from './PatchGameserver'

const Instance = () => {
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
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={12} sm={8}>
          <Search text="instance" handleChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button className={styles.openModalBtn} type="submit" variant="contained" onClick={openPatchModal(true)}>
            Patch Gameserver
          </Button>
        </Grid>
      </Grid>
      <div className={styles.rootTableWithSearch}>
        <InstanceTable search={search} />
      </div>
      {patchGameserverOpen && <PatchGameserver open handleClose={openPatchModal} closeViewModal={closePatchModal} />}
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
