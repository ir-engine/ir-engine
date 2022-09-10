import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'

import Box from '@mui/material/Box'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmDialog from '../../common/ConfirmDialog'
import TableComponent from '../../common/Table'
import { resourceColumns, ResourceData } from '../../common/variables/resource'
import { RESOURCE_PAGE_LIMIT, ResourceService, useAdminResourceState } from '../../services/ResourceService'
import styles from '../../styles/admin.module.scss'
import ResourceDrawer, { ResourceDrawerMode } from './ResourceDrawer'

interface Props {
  className?: string
  search: string
}

const ResourceTable = ({ className, search }: Props) => {
  const { t } = useTranslation()
  const { user } = useAuthState().value
  const adminResourceState = useAdminResourceState()
  const adminResources = adminResourceState.resources
  const adminResourceCount = adminResourceState.total

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(RESOURCE_PAGE_LIMIT)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [resourceId, setResourceId] = useState('')
  const [resourceKey, setResourceKey] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('key')
  const [openResourceDrawer, setOpenResourceDrawer] = useState(false)
  const [resourceData, setResourceData] = useState<StaticResourceInterface | null>(null)

  const handlePageChange = (event: unknown, newPage: number) => {
    ResourceService.fetchAdminResources(newPage, search, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminResourceState.fetched.value) {
      ResourceService.fetchAdminResources(page, search, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    ResourceService.fetchAdminResources(0, search, sortField, fieldOrder)
  }, [user?.id, search, adminResourceState.updateNeeded.value])

  const createData = (el: StaticResourceInterface): ResourceData => {
    return {
      el,
      id: el.id,
      key: el.key,
      mimeType: el.mimeType,
      staticResourceType: el.staticResourceType,
      action: (
        <>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setResourceData(el)
              setOpenResourceDrawer(true)
            }}
          >
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setResourceId(el.id)
              setResourceKey(el.key)
              setOpenConfirm(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const rows = adminResources.value.map((el) => {
    return createData(el)
  })

  const submitRemoveResource = async () => {
    await ResourceService.removeResource(resourceId)
    setOpenConfirm(false)
  }

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder}
        setSortField={setSortField}
        setFieldOrder={setFieldOrder}
        rows={rows}
        column={resourceColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminResourceCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />

      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.resources.confirmResourceDelete')} '${resourceKey}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={submitRemoveResource}
      />

      {resourceData && openResourceDrawer && (
        <ResourceDrawer
          open
          mode={ResourceDrawerMode.ViewEdit}
          selectedResource={resourceData}
          onClose={() => setOpenResourceDrawer(false)}
        />
      )}
    </Box>
  )
}

export default ResourceTable
