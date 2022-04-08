import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Group } from '@xrengine/common/src/interfaces/Group'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { columns, Data } from '../../common/variables/group'
import { GROUP_PAGE_LIMIT, GroupService, useGroupState } from '../../services/GroupService'
import styles from '../../styles/admin.module.scss'
import ViewGroup from './ViewGroup'

interface Props {
  search: string
}

const GroupTable = (props: Props) => {
  const { search } = props
  const user = useAuthState().user
  const [viewModal, setViewModal] = useState(false)
  const [singleGroup, setSingleGroup] = useState<Group>(null!)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(GROUP_PAGE_LIMIT)
  const [groupId, setGroupId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [orderBy, setOrderBy] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [showWarning, setShowWarning] = useState(false)
  const adminGroupState = useGroupState()
  const adminGroups = adminGroupState.group
  const adminGroupCount = adminGroupState.total.value
  const { t } = useTranslation()

  const handlePageChange = (event: unknown, newPage: number) => {
    // const incDec = page < newPage ? 'increment' : 'decrement'
    GroupService.getGroupService(search, newPage, sortField, orderBy)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminGroupState.fetched.value) {
      GroupService.getGroupService(search, page, sortField, orderBy)
    }
  }, [orderBy])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewGroup = (id: string) => {
    const group = adminGroups.value.find((group) => group.id === id)
    if (group !== null) {
      setSingleGroup(group!)
      setViewModal(true)
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

  const closeViewModal = (open) => {
    setViewModal(open)
  }

  useEffect(() => {
    //if (adminGroupState.updateNeeded.value && user.id.value) {
    //  GroupService.getGroupService(null)
    // } else {
    GroupService.getGroupService(search, 0, sortField, orderBy)
    // }
  }, [adminGroupState.updateNeeded.value, user, search])

  const createData = (id: any, name: any, description: string): Data => {
    return {
      id,
      name,
      description,
      action: (
        <>
          <a href="#h" className={styles.actionStyle} onClick={() => handleViewGroup(id)}>
            <span className={styles.spanWhite}>{t('admin:components.group.view')}</span>
          </a>
          <a
            href="#h"
            className={styles.actionStyle}
            onClick={() => {
              handleShowWarning(id)
              setGroupName(name)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.group.delete')}</span>
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
        allowSort={false}
        fieldOrder={orderBy}
        setSortField={setSortField}
        setFieldOrder={setOrderBy}
        rows={rows}
        column={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminGroupCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModal
        popConfirmOpen={showWarning}
        handleCloseModal={handleCloseWarning}
        submit={deleteGroupHandler}
        name={groupName}
        label={'group'}
      />
      {singleGroup && viewModal && (
        <ViewGroup groupAdmin={singleGroup} openView={viewModal} closeViewModal={closeViewModal} />
      )}
    </React.Fragment>
  )
}

export default GroupTable
