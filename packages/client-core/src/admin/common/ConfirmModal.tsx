import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'

import styles from '../styles/admin.module.scss'

interface Props {
  open: boolean
  description: string | JSX.Element
  processing?: boolean
  onClose: () => void
  onSubmit: () => void
}

const ConfirmModal = ({ open, description, processing, onClose, onSubmit }: Props) => {
  const { t } = useTranslation()

  return (
    <Modal open={open} onClose={onClose} className={styles.modal} closeAfterTransition>
      <Fade in={open}>
        <div
          className={classNames({
            [styles.paper]: true,
            [styles.modalContent]: true
          })}
        >
          {!processing && (
            <div>
              <DialogTitle id="alert-dialog-title" style={{ color: 'gray' }}>
                {description}
              </DialogTitle>
              <DialogActions>
                <Button onClick={onClose} className={styles.spanNone}>
                  {t('admin:components.common.cancel')}
                </Button>
                <Button className={styles.spanDange} onClick={onSubmit} autoFocus>
                  {t('admin:components.common.confirm')}
                </Button>
              </DialogActions>
            </div>
          )}
          {processing && (
            <div>
              <CircularProgress color="primary" />
              <div className={styles.accentText}>{t('admin:components.project.processing')}</div>
            </div>
          )}
        </div>
      </Fade>
    </Modal>
  )
}

export default ConfirmModal
