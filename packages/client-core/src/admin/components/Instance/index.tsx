import React, { useEffect } from 'react'

import Button from '@etherealengine/ui/src/Button'
import Grid from '@etherealengine/ui/src/Grid'

import { NotificationService } from '../../../common/services/NotificationService'
import Search from '../../common/Search'
import { useInstanceserverState } from '../../services/InstanceserverService'
import { AdminInstanceService } from '../../services/InstanceService'
import styles from '../../styles/admin.module.scss'
import InstanceTable from './InstanceTable'
import PatchInstanceserver from './PatchInstanceserver'

const Instance = () => {
  const [search, setSearch] = React.useState('')
  const [patchInstanceserverOpen, setPatchInstanceserverOpen] = React.useState(false)
  const instanceserverState = useInstanceserverState()
  const { patch } = instanceserverState.value

  AdminInstanceService.useAPIListeners()

  useEffect(() => {
    if (patch) {
      NotificationService.dispatchNotify(patch.message, { variant: patch.status ? 'success' : 'error' })
    }
  }, [instanceserverState.patch])

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={12} sm={8}>
          <Search text="instance" handleChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            className={styles.openModalBtn}
            type="submit"
            variant="contained"
            onClick={() => setPatchInstanceserverOpen(true)}
          >
            Patch Instanceserver
          </Button>
        </Grid>
      </Grid>
      <InstanceTable className={styles.rootTableWithSearch} search={search} />
      {patchInstanceserverOpen && <PatchInstanceserver open onClose={() => setPatchInstanceserverOpen(false)} />}
    </div>
  )
}

export default Instance
