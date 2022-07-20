import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { Location } from '@xrengine/common/src/interfaces/Location'

import Box from '@mui/material/Box'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmDialog from '../../common/ConfirmDialog'
import TableComponent from '../../common/Table'
import { instanceColumns, InstanceData } from '../../common/variables/instance'
import { AdminInstanceService, INSTANCE_PAGE_LIMIT, useAdminInstanceState } from '../../services/InstanceService'
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
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(INSTANCE_PAGE_LIMIT)
  const [refetch, setRefetch] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [instanceId, setInstanceId] = useState('')
  const [instanceName, setInstanceName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('createdAt')
  const { t } = useTranslation()

  const user = useAuthState().user
  const adminInstanceState = useAdminInstanceState()
  const adminInstances = adminInstanceState

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminInstanceService.fetchAdminInstances(search, newPage, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminInstanceState.fetched.value) {
      AdminInstanceService.fetchAdminInstances(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const submitRemoveInstance = async () => {
    await AdminInstanceService.removeInstance(instanceId)
    setOpenConfirm(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }
  const isMounted = useRef(false)

  const fetchTick = () => {
    setTimeout(() => {
      if (!isMounted.current) return
      setRefetch(true)
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
    if ((user.id.value && adminInstances.updateNeeded.value) || refetch) {
      AdminInstanceService.fetchAdminInstances(search, page, sortField, fieldOrder)
    }
    setRefetch(false)
  }, [user, adminInstanceState.updateNeeded.value, refetch])

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
            setInstanceId(id)
            setInstanceName(ipAddress)
            setOpenConfirm(true)
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
        fieldOrder={fieldOrder}
        setSortField={setSortField}
        setFieldOrder={setFieldOrder}
        rows={rows}
        column={instanceColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminInstances.total.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.instance.confirmInstanceDelete')} '${instanceName}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={submitRemoveInstance}
      />
    </Box>
  )
}

export default InstanceTable
