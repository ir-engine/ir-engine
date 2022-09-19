import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

import ProfileMenu from '../../user/components/UserMenu/menus/ProfileMenu'
import SettingMenu from '../../user/components/UserMenu/menus/SettingMenu'
import { Views } from '../../user/components/UserMenu/util'
import styles from '../styles/admin.module.scss'

const FormDialog = () => {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(true)
  const [selectedMenu, setSelectedMenu] = useState(Views.Profile)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        classes={{ paper: styles.paperDialog }}
      >
        <DialogTitle id="form-dialog-title"> {t('admin:components.dialog.noAccess')}</DialogTitle>
        <DialogContent>
          <DialogContentText className={`${styles.spanNone} ${styles.mgBottom}`}>
            {t('admin:components.dialog.askAccessResourceMessage')}
          </DialogContentText>
          <TextField autoFocus id="name" label="Username" type="text" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} className={styles.outlinedButton}>
            {t('admin:components.dialog.login')}
          </Button>
          <Button onClick={handleClose} className={styles.gradientButton}>
            {t('admin:components.common.submit')}
          </Button>
        </DialogActions>
      </Dialog>
      {!open && (
        <div className="form-container">
          <style>
            {`
                [class*=menuPanel] {
                    position: absolute;
                    top: 50%;
                    right: 50%;
                    left: auto;
                    transform: translate(50%,-50%);Profile
                    margin: 0;
                    pointer-events: auto;
                  }
                `}
          </style>
          {selectedMenu === Views.Profile && (
            <ProfileMenu changeActiveMenu={(type) => setSelectedMenu(type ? type : Views.Profile)} />
          )}
          {selectedMenu === Views.Settings && (
            <SettingMenu changeActiveMenu={(type) => setSelectedMenu(type ? type : Views.Profile)} />
          )}
        </div>
      )}
    </div>
  )
}

export default FormDialog
