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
  popConfirmOpen: boolean
  handleCloseModal: () => void
  submit: () => void
  name: string | JSX.Element
  label: string
  type?: string
  processing?: boolean
}

const ConfirmModal = (props: Props) => {
  const { t } = useTranslation()
  const { popConfirmOpen, handleCloseModal, submit, name, label, type, processing } = props
  return (
    <Modal
      open={popConfirmOpen}
      onClose={handleCloseModal}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className={styles.modal}
      closeAfterTransition
    >
      <Fade in={popConfirmOpen}>
        <div
          className={classNames({
            [styles.paper]: true,
            [styles.modalContent]: true
          })}
        >
          {!processing && (
            <div>
              <DialogTitle id="alert-dialog-title" style={{ color: 'gray' }}>
                {t('admin:components.common.doYouWantTo')} {type || 'delete'} {label} <b>{name}</b> ?
              </DialogTitle>
              <DialogActions>
                <Button onClick={handleCloseModal} className={styles.spanNone}>
                  {t('admin:components.common.cancel')}
                </Button>
                <Button className={styles.spanDange} onClick={submit} autoFocus>
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
