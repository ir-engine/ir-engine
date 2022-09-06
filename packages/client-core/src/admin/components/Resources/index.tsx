import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import ResourceTable from './ResourceTable'

const Resources = () => {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <React.Fragment>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item md={12}>
          <Search text={t('admin:components.resources.resources')} handleChange={handleChange} />
        </Grid>
      </Grid>

      <ResourceTable className={styles.rootTableWithSearch} search={search} />
    </React.Fragment>
  )
}

export default Resources
