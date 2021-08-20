import classNames from 'classnames'
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import styles from './AlertModals.module.scss'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

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
  const [countdown, setCountdown] = useState(null)
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
    if (open && !noCountdown) {
      setTimeRemaining((timeout || 10000) / 1000)
    } else {
      clearInterval(countdown as any)
    }
  }, [open])

  useEffect(() => {
    if (timeRemaining === 0) {
      if (typeof action === 'function') {
        action(...(parameters || []))
      }

      if (typeof handleClose === 'function') {
        handleClose({}, 'timeout')
      }
    }

    if (timeRemaining !== 0) {
      setCountdown(
        setTimeout(() => {
          setTimeRemaining(timeRemaining - 1)
        }, 1000)
      )
    }

    return () => clearInterval(countdown as any)
  }, [timeRemaining])

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
              <IconButton aria-label="close" className={styles.closeButton} onClick={handleCloseButtonClick}>
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
