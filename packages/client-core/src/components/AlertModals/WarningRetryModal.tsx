import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import CloseIcon from '@mui/icons-material/Close'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'

import styles from './index.module.scss'

export interface WarningRetryModalProps {
  open: boolean
  title: string
  body: string
  action?: (...params: any[]) => void
  parameters?: any[]
  timeout?: number
  closeEffect?: () => void
  noCountdown?: boolean
  onClose: (event?: any, reason?: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClicked' | 'timeout') => void
}

const WarningRetryModal = ({
  open = false,
  title = '',
  body = '',
  noCountdown = false,
  action,
  parameters = [],
  timeout = 10000,
  closeEffect,
  onClose
}: WarningRetryModalProps): any => {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const { t } = useTranslation()
  const handleCloseButtonClick = (e: any) => {
    onClose(e, 'closeButtonClicked')

    if (typeof closeEffect === 'function') {
      closeEffect()
    }
  }

  useEffect(() => {
    !noCountdown && setTimeRemaining((timeout || 10000) / 1000)
  }, [open, timeout])

  useEffect(() => {
    if (!open) return
    if (!noCountdown && timeRemaining <= 0) {
      if (typeof action === 'function') {
        action(...(parameters || []))
      }

      onClose({}, 'timeout')
    }

    let timeout = undefined! as number
    if (!noCountdown && timeRemaining > 0) {
      timeout = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000) as any
    }

    return () => clearTimeout(timeout)
  }, [timeRemaining, open])

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={open}
        onClose={(event, reason) => {
          if (reason === 'backdropClick' && typeof closeEffect === 'function') closeEffect()
          else onClose(event, reason)
        }}
        closeAfterTransition
      >
        <Fade in={open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles.modalContent]: true
            })}
          >
            <div className={styles.modalHeader}>
              <div />
              <div className={styles['title']}>{title}</div>
              <IconButton
                aria-label="close"
                className={styles.closeButton}
                onClick={handleCloseButtonClick}
                size="large"
              >
                <CloseIcon />
              </IconButton>
            </div>
            <div className={styles['modal-body']}>
              {body}
              {!noCountdown && (
                <>
                  <div>
                    {timeRemaining} {t('common:alert.seconds')}
                  </div>
                  <div className={styles.footer}>{t('common:alert.cancelCountdown')}</div>
                </>
              )}
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default WarningRetryModal
