import React, { useState } from 'react'

import { InviteService } from '../../../social/services/InviteService'
import { INVITE_PAGE_LIMIT, useInviteState } from '../../../social/services/InviteService'
import TableComponent from '../../common/Table'
import { inviteColumns } from '../../common/variables/invite'

interface Props {
  invites: any
  search: string
}

const ReceivedInvite = (props: Props) => {
  const { invites } = props
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(INVITE_PAGE_LIMIT)
  const inviteState = useInviteState()
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const receivedInviteCount = inviteState.receivedInvites.total.value
  const rows = invites.map((el, index) => createData(el.id, el.user.name, el.passcode, el.inviteType))

  const handlePageChange = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    InviteService.retrieveReceivedInvites(incDec)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const createData = (id: string, name: string, passcode: string, type: string) => {
    return { id, name, passcode, type }
  }

  return (
    <TableComponent
      allowSort={false}
      fieldOrder={fieldOrder}
      setSortField={setSortField}
      setFieldOrder={setFieldOrder}
      rows={rows}
      column={inviteColumns}
      page={page}
      rowsPerPage={rowsPerPage}
      count={receivedInviteCount}
      handlePageChange={handlePageChange}
      handleRowsPerPageChange={handleRowsPerPageChange}
    />
  )
}

export default ReceivedInvite
