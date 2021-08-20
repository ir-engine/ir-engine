import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import { TableContainer, TableHead, TablePagination, TableRow } from '@material-ui/core'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectGroupState } from '../../reducers/admin/group/selector'
import { getGroupService } from '../../reducers/admin/group/service'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { columns, Data } from './Variables'
import { useStyles, useStyle } from './styles'
import ViewGroup from './ViewGroup'

interface Props {
  adminGroupState?: any
  fetchAdminGroup?: any
  authState?: any
}

const mapStateToProps = (state: any): any => ({
  adminGroupState: selectGroupState(state),
  authState: selectAuthState(state)
})

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchAdminGroup: bindActionCreators(getGroupService, dispatch)
})

const GroupTable = (props: Props) => {
  const { adminGroupState, fetchAdminGroup, authState } = props
  const classes = useStyles()
  const classx = useStyle()

  const [viewModel, setViewModel] = React.useState(false)
  const [singleGroup, setSingleGroup] = React.useState('')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(12)
  const adminGroups = adminGroupState.get('group').get('group')
  const user = authState.get('user')

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleViewGroup = (id: string) => {
    const group = adminGroups.find((group) => group.id === id)
    setSingleGroup(group)
    setViewModel(true)
  }

  const closeViewModel = (open) => {
    setViewModel(open)
  }

  React.useEffect(() => {
    const fetchGroups = async () => {
      await fetchAdminGroup()
    }
    if (adminGroupState.get('group').get('updateNeeded')) fetchGroups()
  }, [adminGroupState, user])

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
          <a href="#h" className={classes.actionStyle}>
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  const rows = adminGroups.map((el) => {
    return createData(el.id, el.name, el.description)
  })

  const count = rows.size ? rows.size : rows.length

  return (
    <div className={classx.root}>
      <TableContainer className={classx.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classes.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {columns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classes.tableCellBody}>
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
        rowsPerPageOptions={[12]}
        component="div"
        count={count || 12}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classes.tableFooter}
      />
      {singleGroup && <ViewGroup groupAdmin={singleGroup} openView={viewModel} closeViewModal={closeViewModel} />}
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupTable)
