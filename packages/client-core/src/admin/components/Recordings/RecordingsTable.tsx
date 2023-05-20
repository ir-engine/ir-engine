import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { getMutableState } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import ConfirmDialog from '../../../common/components/ConfirmDialog'
import TableComponent from '../../common/Table'
import { recordingColumns } from '../../common/variables/recording'
import { AdminRecordingService, AdminRecordingState, RECORDING_PAGE_LIMIT } from '../../services/RecordingService'
import styles from '../../styles/admin.module.scss'
import RecordingFilesDrawer from './RecordingsDrawer'

const RecordingsTable = () => {
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(RECORDING_PAGE_LIMIT)
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('createdAt')
  const openConfirm = useHookstate(false)
  const currentRecordingId = useHookstate<string | null>(null)
  const recordingResourcesDrawerOpen = useHookstate<boolean>(false)
  const { t } = useTranslation()

  const handlePageChange = (_event: unknown, newPage: number) => {
    page.set(newPage)
  }
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }

  const adminRecordingsState = useHookstate(getMutableState(AdminRecordingState))

  useEffect(() => {
    if (adminRecordingsState.updateNeeded.value) {
      AdminRecordingService.fetchAdminRecordings(null, page.value, sortField.value, fieldOrder.value, rowsPerPage.value)
    }
  }, [page.value, sortField.value, fieldOrder.value, rowsPerPage.value, adminRecordingsState.updateNeeded.value])

  const handleSubmitRemove = () => {
    if (currentRecordingId.value) {
      AdminRecordingService.removeRecording(currentRecordingId.value)
      openConfirm.set(false)
      currentRecordingId.set(null)
    }
  }

  const createData = (el: RecordingResult, id: string, user: string, ended: boolean, schema: string) => ({
    el,
    id,
    user,
    ended: ended ? t('admin:components.common.yes') : t('admin:components.common.no'),
    schema,
    view: (
      <IconButton
        className={styles.iconButton}
        name="view"
        onClick={() => {
          currentRecordingId.set(id)
          recordingResourcesDrawerOpen.set(true)
        }}
        icon={<Icon type="Visibility" />}
      />
    ),
    action: (
      <IconButton
        className={styles.iconButton}
        name="remove"
        onClick={() => {
          currentRecordingId.set(el.id)
          openConfirm.set(true)
        }}
        icon={<Icon type="Cancel" />}
      />
    )
  })

  const rows = adminRecordingsState.recordings.value.map((val) =>
    createData(val, val.id, val['user.name'], val.ended, val.schema)
  )

  return (
    <Box>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder.value}
        setSortField={sortField.set}
        setFieldOrder={fieldOrder.set}
        rows={rows}
        column={recordingColumns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminRecordingsState.total.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.recording.confirmRecordingDelete')} '${currentRecordingId.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={handleSubmitRemove}
      />
      <RecordingFilesDrawer
        open={recordingResourcesDrawerOpen.value}
        selectedRecordingId={currentRecordingId.value}
        onClose={() => {
          recordingResourcesDrawerOpen.set(false)
          currentRecordingId.set(null)
        }}
      />
    </Box>
  )
}

export default RecordingsTable
