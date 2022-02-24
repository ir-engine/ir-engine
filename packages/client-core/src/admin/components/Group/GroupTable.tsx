import { Group } from '@xrengine/common/src/interfaces/Group'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModel from '../../common/ConfirmModel'
import TableComponent from '../../common/Table'
import { columns, Data } from '../../common/variables/group'
import { GroupService, GROUP_PAGE_LIMIT, useGroupState } from '../../services/GroupService'
import { useStyles } from '../../styles/ui'
import ViewGroup from './ViewGroup'

interface Props {
  search: string
}

const GroupTable = (props: Props) => {
  const { search } = props
  const dispatch = useDispatch()
  const classes = useStyles()
  const user = useAuthState().user
  const [viewModel, setViewModel] = useState(false)
  const [singleGroup, setSingleGroup] = useState<Group>(null!)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(GROUP_PAGE_LIMIT)
  const [groupId, setGroupId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const adminGroupState = useGroupState()
  const adminGroups = adminGroupState.group
  const adminGroupCount = adminGroupState.total.value

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    GroupService.getGroupService(incDec, null, newPage)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewGroup = (id: string) => {
    const group = adminGroups.value.find((group) => group.id === id)
    if (group !== null) {
      setSingleGroup(group!)
      setViewModel(true)
    }
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }

  const handleShowWarning = (id: string) => {
    setGroupId(id)
    setShowWarning(true)
  }

  const deleteGroupHandler = () => {
    setShowWarning(false)
    GroupService.deleteGroupByAdmin(groupId)
  }

  const closeViewModel = (open) => {
    setViewModel(open)
  }

  useEffect(() => {
    if (adminGroupState.updateNeeded.value && user.id.value) {
      GroupService.getGroupService('increment', null)
    }
    GroupService.getGroupService('increment', search)
  }, [adminGroupState.updateNeeded.value, user, search])

  const createData = (id: any, name: any, description: string): Data => {
    return {
      id,
      name,
      description,
      action: (
        <>
          <a href="#h" className={classes.actionStyle} onClick={() => handleViewGroup(id)}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a
            href="#h"
            className={classes.actionStyle}
            onClick={() => {
              handleShowWarning(id)
              setGroupName(name)
            }}
          >
            <span className={classes.spanDange}>Delete</span>
          </a>
        </>
      )
    }
  }

  const rows = adminGroups.value.map((el) => {
    return createData(el.id, el.name, el.description!)
  })

  return (
    <React.Fragment>
      <TableComponent
        rows={rows}
        column={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminGroupCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModel
        popConfirmOpen={showWarning}
        handleCloseModel={handleCloseWarning}
        submit={deleteGroupHandler}
        name={groupName}
        label={'group'}
      />
      {singleGroup && viewModel && (
        <ViewGroup groupAdmin={singleGroup} openView={viewModel} closeViewModal={closeViewModel} />
      )}
    </React.Fragment>
  )
}

export default GroupTable
