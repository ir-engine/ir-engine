import React, { useEffect } from 'react'

import { addActionReceptor, removeActionReceptor } from '@xrengine/hyperflux'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import { NotificationService } from '../../../common/services/NotificationService'
import Search from '../../common/Search'
import { AdminInstanceServerServiceReceptor, useInstanceserverState } from '../../services/InstanceserverService'
import { AdminInstanceServiceReceptor } from '../../services/InstanceService'
import styles from '../../styles/admin.module.scss'
import InstanceTable from './InstanceTable'
import PatchInstanceserver from './PatchInstanceserver'

const Instance = () => {
  const [search, setSearch] = React.useState('')
  const [patchInstanceserverOpen, setPatchInstanceserverOpen] = React.useState(false)
  const instanceserverState = useInstanceserverState()
  const { patch } = instanceserverState.value

  useEffect(() => {
    addActionReceptor(AdminInstanceServerServiceReceptor)
    addActionReceptor(AdminInstanceServiceReceptor)
    return () => {
      removeActionReceptor(AdminInstanceServerServiceReceptor)
      removeActionReceptor(AdminInstanceServiceReceptor)
    }
  }, [])

  useEffect(() => {
    if (patch) {
      NotificationService.dispatchNotify(patch.message, { variant: patch.status === true ? 'success' : 'error' })
    }
  }, [instanceserverState.patch])

  const openPatchModal = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setPatchInstanceserverOpen(open)
  }

  const closePatchModal = (open: boolean) => {
    setPatchInstanceserverOpen(open)
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
            Patch Instanceserver
          </Button>
        </Grid>
      </Grid>
      <InstanceTable className={styles.rootTableWithSearch} search={search} />
      {patchInstanceserverOpen && (
        <PatchInstanceserver open handleClose={openPatchModal} closeViewModal={closePatchModal} />
      )}
    </React.Fragment>
  )
}

export default Instance
