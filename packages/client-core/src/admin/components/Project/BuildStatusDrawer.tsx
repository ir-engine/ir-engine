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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { BuildStatusType, buildStatusPath } from '@etherealengine/engine/src/schemas/cluster/build-status.schema'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import DrawerView from '../../common/DrawerView'
import TableComponent from '../../common/Table'
import { buildStatusColumns } from '../../common/variables/buildStatus'
import styles from '../../styles/admin.module.scss'
import BuildStatusLogsModal from './BuildStatusLogsModal'

interface Props {
  open: boolean
  onClose: () => void
}

const defaultBuildStatus: BuildStatusType = {
  id: 0,
  commitSHA: '',
  status: '',
  dateStarted: '',
  dateEnded: '',
  logs: '',
  createdAt: '',
  updatedAt: ''
}

const BuildStatusDrawer = ({ open, onClose }: Props) => {
  const { t } = useTranslation()

  const selectedStatusId = useHookstate(0)
  const logsModalOpen = useHookstate(false)

  const buildStatusesQuery = useFind(buildStatusPath, {
    query: { $limit: 10, $sort: { id: -1 } }
  })

  const handleOpenLogsModal = (buildStatus: BuildStatusType) => {
    selectedStatusId.set(buildStatus.id)
    logsModalOpen.set(true)
  }

  const handleClose = () => {
    onClose()
  }

  const handleCloseLogsModal = () => {
    logsModalOpen.set(false)
    selectedStatusId.set(0)
  }
  const createData = (el: BuildStatusType) => {
    return {
      el,
      id: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span>{el.id}</span>
        </Box>
      ),
      commitSHA: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span>{el.commitSHA?.slice(0, 8)}</span>
        </Box>
      ),
      status: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span>{el.status}</span>
        </Box>
      ),
      dateStarted: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span>
            {new Date(el.dateStarted).toLocaleString('en-us', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            })}
          </span>
        </Box>
      ),
      dateEnded: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span>
            {el.dateEnded &&
              new Date(el.dateEnded).toLocaleString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
              })}
            {!el.dateEnded && 'Running'}
          </span>
        </Box>
      ),
      logs: (
        <>
          <IconButton
            className={styles.iconButton}
            name="update"
            disabled={el.logs == null || el.logs?.length === 0}
            onClick={() => handleOpenLogsModal(el)}
            icon={<Icon type="TextSnippet" />}
          />
        </>
      )
    }
  }

  const rows = buildStatusesQuery.data.map((el) => {
    return createData(el)
  })

  const selectedStatus = buildStatusesQuery.data.find((el) => el.id === selectedStatusId.value) || defaultBuildStatus

  return (
    <DrawerView open={open} onClose={handleClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{t('admin:components.project.buildStatus')}</DialogTitle>
        <TableComponent query={buildStatusesQuery} rows={rows} column={buildStatusColumns} />
        <BuildStatusLogsModal open={logsModalOpen.value} onClose={handleCloseLogsModal} buildStatus={selectedStatus} />
      </Container>
    </DrawerView>
  )
}

export default BuildStatusDrawer
