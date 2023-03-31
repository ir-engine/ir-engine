import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { resourceColumns, ResourceData } from '../../common/variables/resource'
import { AdminResourceState, RESOURCE_PAGE_LIMIT, ResourceService } from '../../services/ResourceService'
import styles from '../../styles/admin.module.scss'
import ResourceDrawer, { ResourceDrawerMode } from './ResourceDrawer'

interface Props {
  className?: string
  search: string
}

const ResourceTable = ({ className, search }: Props) => {
  const { t } = useTranslation()
  const user = useHookstate(getMutableState(AuthState).user).value
  const adminResourceState = useHookstate(getMutableState(AdminResourceState))
  const adminResources = adminResourceState.resources
  const adminResourceCount = adminResourceState.total

  const page = useHookstate(0)
  const rowsPerPage = useHookstate(RESOURCE_PAGE_LIMIT)
  const openConfirm = useHookstate(false)
  const resourceId = useHookstate('')
  const resourceKey = useHookstate('')
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('key')
  const openResourceDrawer = useHookstate(false)
  const resourceData = useHookstate<StaticResourceInterface | null>(null)

  const handlePageChange = (event: unknown, newPage: number) => {
    ResourceService.fetchAdminResources(newPage, search, sortField.value, fieldOrder.value)
    page.set(newPage)
  }

  useEffect(() => {
    if (adminResourceState.fetched.value) {
      ResourceService.fetchAdminResources(page.value, search, sortField.value, fieldOrder.value)
    }
  }, [fieldOrder.value])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(parseInt(event.target.value, 10))
    page.set(0)
  }

  useEffect(() => {
    ResourceService.fetchAdminResources(0, search, sortField.value, fieldOrder.value)
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
              resourceData.set(el)
              openResourceDrawer.set(true)
            }}
          >
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              resourceId.set(el.id)
              resourceKey.set(el.key)
              openConfirm.set(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const rows = adminResources.get({ noproxy: true }).map((el) => {
    return createData(el)
  })

  const submitRemoveResource = async () => {
    await ResourceService.removeResource(resourceId.value)
    openConfirm.set(false)
  }

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder.value}
        setSortField={sortField.set}
        setFieldOrder={fieldOrder.set}
        rows={rows}
        column={resourceColumns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminResourceCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />

      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.resources.confirmResourceDelete')} '${resourceKey.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={submitRemoveResource}
      />

      {resourceData.value && openResourceDrawer.value && (
        <ResourceDrawer
          open
          mode={ResourceDrawerMode.ViewEdit}
          selectedResource={resourceData.value}
          onClose={() => openResourceDrawer.set(false)}
        />
      )}
    </Box>
  )
}

export default ResourceTable
