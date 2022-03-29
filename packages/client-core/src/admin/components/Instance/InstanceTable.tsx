import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { Location } from '@xrengine/common/src/interfaces/Location'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { instanceColumns, InstanceData } from '../../common/variables/instance'
import { InstanceService, INSTNCE_PAGE_LIMIT, useInstanceState } from '../../services/InstanceService'
import styles from '../../styles/admin.module.scss'

interface Props {
  fetchAdminState?: any
  search: any
}

/**
 * JSX used to display table of instance
 *
 * @param props
 * @returns DOM Element
 * @author KIMENYI Kevin
 */
const InstanceTable = (props: Props) => {
  const { search } = props
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(INSTNCE_PAGE_LIMIT)
  const [refetch, setRefetch] = React.useState(false)
  const [popConfirmOpen, setPopConfirmOpen] = React.useState(false)
  const [instanceId, setInstanceId] = React.useState('')
  const [instanceName, setInstanceName] = React.useState('')
  const { t } = useTranslation()

  const user = useAuthState().user
  const adminInstanceState = useInstanceState()
  const adminInstances = adminInstanceState

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    InstanceService.fetchAdminInstances(incDec)
    setPage(newPage)
  }

  const handleCloseModal = () => {
    setPopConfirmOpen(false)
  }

  const submitRemoveInstance = async () => {
    await InstanceService.removeInstance(instanceId)
    setPopConfirmOpen(false)
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
      InstanceService.fetchAdminInstances('increment', search)
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
          href="#h"
          className={styles.actionStyle}
          onClick={() => {
            setPopConfirmOpen(true)
            setInstanceId(id)
            setInstanceName(ipAddress)
          }}
        >
          <span className={styles.spanDange}>{t('admin:components.locationModal.lbl-delete')}</span>
        </a>
      )
    }
  }

  const rows = adminInstances.instances.value.map((el: Instance) =>
    createData(el.id, el.ipAddress, el.currentUsers, el.channelId || '', el.podName || '', el.location)
  )

  return (
    <React.Fragment>
      <TableComponent
        rows={rows}
        column={instanceColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminInstances.total.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModal
        popConfirmOpen={popConfirmOpen}
        handleCloseModal={handleCloseModal}
        submit={submitRemoveInstance}
        name={instanceName}
        label={'instance'}
      />
    </React.Fragment>
  )
}

export default InstanceTable
