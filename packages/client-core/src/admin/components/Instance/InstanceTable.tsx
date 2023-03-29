import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { Location } from '@etherealengine/common/src/interfaces/Location'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { instanceColumns, InstanceData } from '../../common/variables/instance'
import { AdminInstanceService, AdminInstanceState, INSTANCE_PAGE_LIMIT } from '../../services/InstanceService'
import styles from '../../styles/admin.module.scss'

interface Props {
  className?: string
  search: string
}

/**
 * JSX used to display table of instance
 *
 * @param props
 * @returns DOM Element
 */
const InstanceTable = ({ className, search }: Props) => {
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(INSTANCE_PAGE_LIMIT)
  const refetch = useHookstate(false)
  const openConfirm = useHookstate(false)
  const instanceId = useHookstate('')
  const instanceName = useHookstate('')
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('createdAt')
  const { t } = useTranslation()

  const user = useHookstate(getMutableState(AuthState).user)
  const adminInstanceState = useHookstate(getMutableState(AdminInstanceState))
  const adminInstances = adminInstanceState

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminInstanceService.fetchAdminInstances(search, newPage, sortField.value, fieldOrder.value)
    page.set(newPage)
  }

  useEffect(() => {
    if (adminInstanceState.fetched.value) {
      AdminInstanceService.fetchAdminInstances(search, page.value, sortField.value, fieldOrder.value)
    }
  }, [fieldOrder.value])

  const submitRemoveInstance = async () => {
    await AdminInstanceService.removeInstance(instanceId.value)
    openConfirm.set(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }
  const isMounted = useRef(false)

  const fetchTick = () => {
    setTimeout(() => {
      if (!isMounted.current) return
      refetch.set(true)
      fetchTick()
    }, 5000)
  }

  useEffect(() => {
    isMounted.current = true
    fetchTick()
    return () => {
      isMounted.current = false
    }
  }, [])

  React.useEffect(() => {
    if (!isMounted.current) return
    if ((user.id.value && adminInstances.updateNeeded.value) || refetch.value) {
      AdminInstanceService.fetchAdminInstances(search, page.value, sortField.value, fieldOrder.value)
    }
    refetch.set(false)
  }, [user, adminInstanceState.updateNeeded.value, refetch.value])

  const createData = (
    id: string,
    ipAddress: string,
    currentUsers: Number,
    channelId: string,
    podName: string,
    locationId?: Location
  ): InstanceData => {
    return {
      id,
      ipAddress,
      currentUsers,
      locationId: locationId?.name || '',
      channelId,
      podName,
      action: (
        <a
          href="#"
          className={styles.actionStyle}
          onClick={() => {
            instanceId.set(id)
            instanceName.set(ipAddress)
            openConfirm.set(true)
          }}
        >
          <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
        </a>
      )
    }
  }

  const rows = adminInstances.instances.value.map((el: Instance) =>
    createData(el.id, el.ipAddress, el.currentUsers, el.channelId || '', el.podName || '', el.location)
  )

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder.value}
        setSortField={sortField.set}
        setFieldOrder={fieldOrder.set}
        rows={rows}
        column={instanceColumns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminInstances.total.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.instance.confirmInstanceDelete')} '${instanceName.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={submitRemoveInstance}
      />
    </Box>
  )
}

export default InstanceTable
