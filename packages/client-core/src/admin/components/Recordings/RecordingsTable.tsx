import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { getMutableState } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import Button from '@etherealengine/ui/src/Button'

import TableComponent from '../../common/Table'
import { recordingColumns } from '../../common/variables/recording'
import { AdminRecordingService, AdminRecordingState, RECORDING_PAGE_LIMIT } from '../../services/RecordingService'
import styles from '../../styles/admin.module.scss'

const RecordingsTable = () => {
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(RECORDING_PAGE_LIMIT)
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('createdAt')
  const { t } = useTranslation()

  const handlePageChange = (event: unknown, newPage: number) => {
    page.set(newPage)
  }
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }

  const adminRecordingsState = useHookstate(getMutableState(AdminRecordingState))

  useEffect(() => {
    AdminRecordingService.fetchAdminRecordings(null, page.value, sortField.value, fieldOrder.value, rowsPerPage.value)
  }, [page.value, sortField.value, fieldOrder.value, rowsPerPage.value])

  const createData = (el: RecordingResult, id: string, user: string, ended: boolean, schema: string) => ({
    el,
    id,
    user,
    ended: ended ? t('admin:components.common.yes') : t('admin:components.common.no'),
    schema,
    action: (
      <>
        <Button className={styles.actionStyle} onClick={() => {}}>
          <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
        </Button>
        <Button className={styles.actionStyle} onClick={() => {}}>
          <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
        </Button>
      </>
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
      {/* <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.instance.confirmInstanceDelete')} '${recordingName.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={submitRemoveInstance}
      />
      <InstanceDrawer
        open={openInstanceDrawer.value}
        selectedInstance={instanceAdmin.value}
        onClose={() => openInstanceDrawer.set(false)}
      /> */}
    </Box>
  )
}

export default RecordingsTable
