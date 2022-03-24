import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'

import styles from '../styles/admin.module.scss'

interface Props {
  popConfirmOpen: boolean
  handleCloseModel: () => void
  submit: () => void
  name: string | JSX.Element
  label: string
  type?: string
}

const ConfirmModel = (props: Props) => {
  const { t } = useTranslation()
  const { popConfirmOpen, handleCloseModel, submit, name, label, type } = props
  return (
    <Dialog
      open={popConfirmOpen}
      onClose={handleCloseModel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      classes={{ paper: styles.paperDialog }}
    >
      <DialogTitle id="alert-dialog-title">
        {t('admin:components.common.doYouWantTo')} {type || 'delete'} {label} <b>{name}</b> ?
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleCloseModel} className={styles.spanNone}>
          {t('admin:components.common.cancel')}
        </Button>
        <Button className={styles.spanDange} onClick={submit} autoFocus>
          {t('admin:components.common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmModel
