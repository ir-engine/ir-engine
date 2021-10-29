import React, { useEffect } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import { useAuthState } from '../../../user/state/AuthService'
import { InstanceService } from '../../state/InstanceService'
import { useDispatch } from '../../../store'
import { instanceColumns, InstanceData } from './variables'
import { useInstanceState } from '../../state/InstanceService'
import { useInstanceStyle, useInstanceStyles } from './styles'
import { INSTNCE_PAGE_LIMIT } from '../../state/InstanceService'

interface Props {
  fetchAdminState?: any
}

/**
 * JSX used to display table of instance
 *
 * @param props
 * @returns DOM Element
 * @author KIMENYI Kevin
 */
const InstanceTable = (props: Props) => {
  const dispatch = useDispatch()
  const classes = useInstanceStyle()
  const classex = useInstanceStyles()
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(INSTNCE_PAGE_LIMIT)
  const [refetch, setRefetch] = React.useState(false)

  const user = useAuthState().user
  const adminInstanceState = useInstanceState()
  const adminInstances = adminInstanceState.instances
  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    InstanceService.fetchAdminInstances(incDec)
    setPage(newPage)
  }
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const fetchTick = () => {
    setTimeout(() => {
      setRefetch(true)
      fetchTick()
    }, 5000)
  }

  useEffect(() => {
    fetchTick()
  }, [])

  React.useEffect(() => {
    if ((user.id.value && adminInstances.updateNeeded.value) || refetch === true) InstanceService.fetchAdminInstances()
    setRefetch(false)
  }, [user, adminInstanceState.instances.updateNeeded.value, refetch])

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
        <>
          <a href="#h" className={classes.actionStyle}>
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  const rows = adminInstances.instances.value.map((el: any) =>
    createData(el.id, el.ipAddress, el.currentUsers, el.location, el.channelId || '')
  )

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {instanceColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classex.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {instanceColumns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classex.tableCellBody}>
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[INSTNCE_PAGE_LIMIT]}
        component="div"
        count={adminInstances.total.value}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classex.tableFooter}
      />
    </div>
  )
}

export default InstanceTable
