import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { BuildStatus } from '@etherealengine/common/src/interfaces/BuildStatus'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import Container from '@etherealengine/ui/src/Container'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

import DrawerView from '../../common/DrawerView'
import TableComponent from '../../common/Table'
import { buildStatusColumns } from '../../common/variables/buildStatus'
import { AdminBuildStatusState, BuildStatusService } from '../../services/BuildStatusService'
import styles from '../../styles/admin.module.scss'
import BuildStatusLogsModal from './BuildStatusLogsModal'

interface Props {
  open: boolean
  onClose: () => void
}

const defaultBuildStatus = {
  id: 0,
  commitSHA: '',
  status: '',
  dateStarted: '',
  dateEnded: '',
  logs: ''
}

const BuildStatusDrawer = ({ open, onClose }: Props) => {
  const { t } = useTranslation()
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(10)
  const selectedStatusId = useHookstate(0)
  const logsModalOpen = useHookstate(false)

  const fieldOrder = useHookstate('desc')
  const sortField = useHookstate('id')

  const buildStatusState = useHookstate(getMutableState(AdminBuildStatusState))
  const buildStatuses = buildStatusState.buildStatuses.value

  const handleOpenLogsModal = (buildStatus: BuildStatus) => {
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
  const createData = (el: BuildStatus) => {
    return {
      el,
      id: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span>{el.id}</span>
        </Box>
      ),
      commitSHA: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <span>{el.commitSHA.slice(0, 8)}</span>
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

  const rows = buildStatuses.map((el) => {
    return createData(el)
  })

  const selectedStatus = buildStatuses.find((el) => el.id === selectedStatusId.value) || defaultBuildStatus

  const handlePageChange = (event: unknown, newPage: number) => {
    BuildStatusService.fetchBuildStatus(newPage * 10)
    page.set(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }

  useEffect(() => {
    BuildStatusService.fetchBuildStatus(0)
  }, [])

  return (
    <DrawerView open={open} onClose={handleClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{t('admin:components.project.buildStatus')}</DialogTitle>
        <TableComponent
          allowSort={false}
          fieldOrder={fieldOrder.value}
          setSortField={sortField.set}
          setFieldOrder={fieldOrder.set}
          rows={rows}
          column={buildStatusColumns}
          page={page.value}
          rowsPerPage={rowsPerPage.value}
          count={buildStatusState.total.value}
          handlePageChange={handlePageChange}
          handleRowsPerPageChange={handleRowsPerPageChange}
        />
        <BuildStatusLogsModal open={logsModalOpen.value} onClose={handleCloseLogsModal} buildStatus={selectedStatus} />
      </Container>
    </DrawerView>
  )
}

export default BuildStatusDrawer
