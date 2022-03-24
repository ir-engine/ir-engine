import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import AvatarCreate from './AvatarCreate'
import AvatarTable from './AvatarTable'

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
        <Grid item md={8} xs={6}>
          <Search text="avatar" handleChange={handleChange} />
        </Grid>
        <Grid item md={4} xs={6}>
          <Button className={styles.openModalBtn} type="submit" variant="contained" onClick={handleClickOpen}>
            {t('user:avatar.createAvatar')}
          </Button>
        </Grid>
      </Grid>
      <div className={styles.rootTable}>
        <AvatarTable search={search} />
      </div>
      {open && <AvatarCreate handleClose={handleClose} open={open} />}
    </React.Fragment>
  )
}

export default Avatar
