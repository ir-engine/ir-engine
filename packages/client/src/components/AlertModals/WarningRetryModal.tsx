import classNames from 'classnames'
import React, { useState, useEffect } from 'react'
import styles from './AlertModals.module.scss'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

export interface WarningRetryModalProps {
  open: boolean
  title: string
  body: string
  handleClose?: (event?: any, reason?: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClicked' | 'timeout') => void
  action?: (...params: any[]) => void
  parameters?: any[]
  timeout?: number
  closeEffect?: () => void
  noCountdown?: boolean
}

const WarningRetryModal = ({
  open = false,
  title = '',
  body = '',
  noCountdown = false,
  action,
  parameters = [],
  timeout = 10000,
  handleClose,
  closeEffect
}: WarningRetryModalProps): any => {
  const [timeRemaining, setTimeRemaining] = useState(0)

  const handleCloseButtonClick = (e: any) => {
    if (typeof handleClose === 'function') {
      handleClose(e, 'closeButtonClicked')
    }

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

      if (typeof handleClose === 'function') {
        handleClose({}, 'timeout')
      }
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
          else if (typeof handleClose === 'function') handleClose(event, reason)
        }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles['modal-content']]: true
            })}
          >
            <div className={styles['modal-header']}>
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
                  <div>{timeRemaining} seconds</div>
                  <div className={styles.footer}>Closing this modal will cancel the countdown</div>
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
