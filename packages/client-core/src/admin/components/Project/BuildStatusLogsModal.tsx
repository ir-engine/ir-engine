/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import classNames from 'classnames'
import React from 'react'

import { BuildStatusType } from '@etherealengine/engine/src/schemas/cluster/build-status.schema'
import Fade from '@etherealengine/ui/src/primitives/mui/Fade'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Modal from '@etherealengine/ui/src/primitives/mui/Modal'

import { NotificationService } from '../../../common/services/NotificationService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  onClose: () => void
  buildStatus: BuildStatusType
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
              title="Copy Logs"
              className={styles.closeButton}
              onClick={() => {
                navigator.clipboard.writeText(buildStatus.logs)
                NotificationService.dispatchNotify('Logs Copied', {
                  variant: 'success'
                })
              }}
              size="large"
              icon={<Icon type="ContentCopy" />}
            />
            <IconButton
              title="Close"
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
