import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import AvatarDrawer, { AvatarDrawerMode } from './AvatarDrawer'
import AvatarTable from './AvatarTable'

const Avatar = () => {
  const [search, setSearch] = useState('')
  const [openAvatarDrawer, setOpenAvatarDrawer] = useState(false)
  const { t } = useTranslation()

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <React.Fragment>
      <Grid container spacing={1} className={styles.mb10px}>
        <Grid item xs={12} sm={8}>
          <Search text="avatar" handleChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            className={styles.openModalBtn}
            type="submit"
            variant="contained"
            onClick={() => setOpenAvatarDrawer(true)}
          >
            {t('user:avatar.createAvatar')}
          </Button>
        </Grid>
      </Grid>

      <AvatarTable className={styles.rootTable} search={search} />

      {openAvatarDrawer && (
        <AvatarDrawer open mode={AvatarDrawerMode.Create} onClose={() => setOpenAvatarDrawer(false)} />
      )}
    </React.Fragment>
  )
}

export default Avatar
