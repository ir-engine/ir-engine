import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BuildStatus } from '@etherealengine/common/src/interfaces/BuildStatus'
import Box from '@etherealengine/ui/src/Box'
import Container from '@etherealengine/ui/src/Container'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'

import DrawerView from '../../common/DrawerView'
import TableComponent from '../../common/Table'
import { buildStatusColumns } from '../../common/variables/buildStatus'
import { BuildStatusService, useBuildStatusState } from '../../services/BuildStatusService'
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
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedStatus, setSelectedStatus] = useState(defaultBuildStatus)
  const [logsModalOpen, setLogsModalOpen] = useState(false)

  const [fieldOrder, setFieldOrder] = useState('desc')
  const [sortField, setSortField] = useState('id')

  const buildStatusState = useBuildStatusState()
  const buildStatuses = buildStatusState.buildStatuses.value

  const handleOpenLogsModal = (buildStatus: BuildStatus) => {
    setSelectedStatus(buildStatus)
    setLogsModalOpen(true)
  }

  const handleClose = () => {
    onClose()
  }

  const handleCloseLogsModal = () => {
    setLogsModalOpen(false)
    setSelectedStatus(defaultBuildStatus)
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

  const handlePageChange = (event: unknown, newPage: number) => {
    BuildStatusService.fetchBuildStatus(newPage * 10)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  useEffect(() => {
    BuildStatusService.fetchBuildStatus(0)
  }, [])

  return (
    <DrawerView open={open} onClose={handleClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}></DialogTitle>
        <TableComponent
          allowSort={false}
          fieldOrder={fieldOrder}
          setSortField={setSortField}
          setFieldOrder={setFieldOrder}
          rows={rows}
          column={buildStatusColumns}
          page={page}
          rowsPerPage={rowsPerPage}
          count={buildStatusState.total.value}
          handlePageChange={handlePageChange}
          handleRowsPerPageChange={handleRowsPerPageChange}
        />
        <BuildStatusLogsModal open={logsModalOpen} onClose={handleCloseLogsModal} buildStatus={selectedStatus} />
      </Container>
    </DrawerView>
  )
}

export default BuildStatusDrawer
