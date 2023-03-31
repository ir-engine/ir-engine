import classNames from 'classnames'
import React from 'react'

import { BuildStatus } from '@etherealengine/common/src/interfaces/BuildStatus'
import Fade from '@etherealengine/ui/src/Fade'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import Modal from '@etherealengine/ui/src/Modal'

import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  onClose: () => void
  buildStatus: BuildStatus
}

const BuildStatusLogsModal = ({ open, onClose, buildStatus }: Props) => {
  const formattedStart = new Date(buildStatus.dateStarted).toLocaleString('en-us', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
  const formattedEnd =
    buildStatus.dateEnded?.length > 0
      ? new Date(buildStatus.dateEnded).toLocaleString('en-us', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        })
      : ''
  let title = `Build #${buildStatus.id} -- Status: ${buildStatus.status} -- Started: ${formattedStart}`
  if (formattedEnd.length > 0) title += ` -- Ended: ${formattedEnd}`
  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={styles.modal}
      open={open}
      onClose={onClose}
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
            <div className={styles['title']}>{title}</div>
            <IconButton
              title="close"
              className={styles.closeButton}
              onClick={onClose}
              size="large"
              icon={<Icon type="Close" />}
            />
          </div>
          <pre className={styles['modal-body']}>{buildStatus.logs}</pre>
        </div>
      </Fade>
    </Modal>
  )
}

export default BuildStatusLogsModal
