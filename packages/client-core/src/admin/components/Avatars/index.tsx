import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import AvatarTable from './AvatarTable'
import ViewAvatar from './ViewAvatar'

const Avatar = () => {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

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
          <Button className={styles.openModalBtn} type="submit" variant="contained" onClick={handleClickOpen}>
            {t('user:avatar.createAvatar')}
          </Button>
        </Grid>
      </Grid>
      <div className={styles.rootTable}>
        <AvatarTable search={search} />
      </div>
      {open && <ViewAvatar closeViewModal={handleClose} openView={open} />}
    </React.Fragment>
  )
}

export default Avatar
