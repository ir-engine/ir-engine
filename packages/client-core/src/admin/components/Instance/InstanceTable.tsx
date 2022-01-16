import React, { useEffect, useRef } from 'react'
import { useAuthState } from '../../../user/services/AuthService'
import { InstanceService } from '../../services/InstanceService'
import { useDispatch } from '../../../store'
import { instanceColumns, InstanceData } from '../../common/variables/instance'
import { useInstanceState } from '../../services/InstanceService'
import { useStyles } from '../../styles/ui'
import { INSTNCE_PAGE_LIMIT } from '../../services/InstanceService'
import ConfirmModel from '../../common/ConfirmModel'
import TableComponent from '../../common/Table'

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
  const dispatch = useDispatch()
  const classes = useStyles()
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(INSTNCE_PAGE_LIMIT)
  const [refetch, setRefetch] = React.useState(false)
  const [popConfirmOpen, setPopConfirmOpen] = React.useState(false)
  const [instanceId, setInstanceId] = React.useState('')
  const [instanceName, setInstanceName] = React.useState('')

  const user = useAuthState().user
  const adminInstanceState = useInstanceState()
  const adminInstances = adminInstanceState

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    InstanceService.fetchAdminInstances(incDec)
    setPage(newPage)
  }

  const handleCloseModel = () => {
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
    if ((user.id.value && adminInstances.updateNeeded.value) || refetch === true) {
      InstanceService.fetchAdminInstances('increment', search)
    }
    setRefetch(false)
  }, [user, adminInstanceState.updateNeeded.value, refetch])

  const createData = (
    id: string,
    ipAddress: string,
    currentUsers: Number,
    locationId: any,
    channelId: string
  ): InstanceData => {
    return {
      id,
      ipAddress,
      currentUsers,
      locationId: locationId?.name || '',
      channelId,
      action: (
        <a
          href="#h"
          className={classes.actionStyle}
          onClick={() => {
            setPopConfirmOpen(true)
            setInstanceId(id)
            setInstanceName(ipAddress)
          }}
        >
          <span className={classes.spanDange}>Delete</span>
        </a>
      )
    }
  }

  const rows = adminInstances.instances.value.map((el: any) =>
    createData(el.id, el.ipAddress, el.currentUsers, el.location, el.channelId || '')
  )

  return (
    <div>
      <TableComponent
        rows={rows}
        column={instanceColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminInstances.total.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModel
        popConfirmOpen={popConfirmOpen}
        handleCloseModel={handleCloseModel}
        submit={submitRemoveInstance}
        name={instanceName}
        label={'instance'}
      />
    </div>
  )
}

export default InstanceTable
