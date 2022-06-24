import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import CreateGroup from './CreateGroup'
import GroupTable from './GroupTable'

const GroupConsole = () => {
  const [openGroupCreate, setOpenGroupCreate] = useState(false)
  const [search, setSearch] = React.useState('')
  const { t } = useTranslation()

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <React.Fragment>
      <div>
        <Grid container spacing={1} className={styles.mb10px}>
          <Grid item xs={12} sm={8}>
            <Search text="group" handleChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              className={styles.openModalBtn}
              type="submit"
              variant="contained"
              onClick={() => setOpenGroupCreate(true)}
            >
              {t('admin:components.group.createGroup')}
            </Button>
          </Grid>
        </Grid>

        <GroupTable className={styles.rootTableWithSearch} search={search} />
      </div>
      <CreateGroup open={openGroupCreate} onClose={() => setOpenGroupCreate(false)} />
    </React.Fragment>
  )
}

export default GroupConsole
