import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { addActionReceptor, dispatchAction, removeActionReceptor } from '@xrengine/hyperflux'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'

import { AdminAvatarActions, AdminAvatarServiceReceptor } from '../../../admin/services/AvatarService'
import AvatarSelectMenu from '../../../user/components/UserMenu/menus/AvatarSelectMenu'
import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import AvatarTable from './AvatarTable'

const Avatar = () => {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    addActionReceptor(AdminAvatarServiceReceptor)
    return () => {
      removeActionReceptor(AdminAvatarServiceReceptor)
    }
  }, [])

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
      {open && (
        <Drawer anchor="right" open={open} onClose={handleClose} classes={{ paper: styles.paperDrawer }}>
          <AvatarSelectMenu
            adminStyles={styles}
            onAvatarUpload={() => dispatchAction(AdminAvatarActions.avatarUpdated())}
            changeActiveMenu={handleClose}
          />
        </Drawer>
      )}
    </React.Fragment>
  )
}

export default Avatar
