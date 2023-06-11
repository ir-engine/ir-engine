import React, { useEffect } from 'react'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'

import { NotificationService } from '../../../common/services/NotificationService'
import Search from '../../common/Search'
import { AdminInstanceServerState } from '../../services/InstanceserverService'
import { AdminInstanceService } from '../../services/InstanceService'
import styles from '../../styles/admin.module.scss'
import InstanceTable from './InstanceTable'
import PatchInstanceserver from './PatchInstanceserver'

const Instance = () => {
  const search = useHookstate('')
  const patchInstanceserverOpen = useHookstate(false)
  const patch = useHookstate(getMutableState(AdminInstanceServerState).patch)

  AdminInstanceService.useAPIListeners()

  useEffect(() => {
    if (patch.value) {
      NotificationService.dispatchNotify(patch.value.message, { variant: patch.value.status ? 'success' : 'error' })
    }
  }, [patch.value])

  const handleChange = (e: any) => {
    search.set(e.target.value)
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
            onClick={() => patchInstanceserverOpen.set(true)}
          >
            Patch Instanceserver
          </Button>
        </Grid>
      </Grid>
      <InstanceTable className={styles.rootTableWithSearch} search={search.value} />
      {patchInstanceserverOpen.value && <PatchInstanceserver open onClose={() => patchInstanceserverOpen.set(false)} />}
    </div>
  )
}

export default Instance
