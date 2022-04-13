import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import CreateGroup from './CreateGroup'
import GroupTable from './GroupTable'

const GroupConsole = () => {
  const [groupOpen, setGroupOpen] = useState(false)
  const [search, setSearch] = React.useState('')
  const { t } = useTranslation()

  const openModalCreate = (open: boolean) => {
    setGroupOpen(open)
  }
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
              onClick={() => openModalCreate(true)}
            >
              {t('admin:components.group.createGroup')}
            </Button>
          </Grid>
        </Grid>
        <div className={styles.rootTableWithSearch}>
          <GroupTable search={search} />
        </div>
      </div>
      <CreateGroup open={groupOpen} handleClose={openModalCreate} />
    </React.Fragment>
  )
}

export default GroupConsole
