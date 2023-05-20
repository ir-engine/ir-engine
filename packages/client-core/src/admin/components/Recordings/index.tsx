import React from 'react'

import Grid from '@etherealengine/ui/src/primitives/mui/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import RecordingsTable from './RecordingsTable'

const Recordings = () => {
  return (
    <div>
      <h1>recordings page</h1>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={12} sm={8}>
          <Search text="instance" handleChange={() => {}} />
        </Grid>
      </Grid>
      <RecordingsTable />
      {/* <InstanceTable className={styles.rootTableWithSearch} search={search.value} />
      {patchInstanceserverOpen.value && <PatchInstanceserver open onClose={() => patchInstanceserverOpen.set(false)} />} */}
    </div>
  )
}

export default Recordings
