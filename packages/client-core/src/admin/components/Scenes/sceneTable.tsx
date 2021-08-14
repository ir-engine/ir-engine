import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import { Dispatch, bindActionCreators } from 'redux'
import { useStyles, useStyle } from './styles'
import { columns, Data } from './variables'
import TablePagination from '@material-ui/core/TablePagination'
import { fetchAdminScenes } from '../../reducers/admin/scene/service'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { selectAdminSceneState } from '../../reducers/admin/scene/selector'
import ViewScene from './viewScene'

interface Props {
  fetchSceneAdmin?: any
  authState?: any
  adminSceneState?: any
  deleteScene?: any
}

const mapStateToProps = (state: any): any => ({
  authState: selectAuthState(state),
  adminSceneState: selectAdminSceneState(state)
})

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchSceneAdmin: bindActionCreators(fetchAdminScenes, dispatch)
})

const SceneTable = (props: Props) => {
  const { fetchSceneAdmin, deleteScene, authState, adminSceneState } = props
  const classx = useStyles()
  const classes = useStyle()
  const user = authState.get('user')
  const scene = adminSceneState?.get('scenes')
  const sceneData = scene?.get('scenes')
  const [singleScene, setSingleScene] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [showWarning, setShowWarning] = React.useState(false)
  const [sceneId, setSceneId] = React.useState('')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(12)

  console.log(sceneData)

  React.useEffect(() => {
    if (user.id && scene.get('updateNeeded')) {
      fetchSceneAdmin()
    }
  }, [user, scene])

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleClose = (open: boolean) => {
    setOpen(open)
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }

  const data = [
    {
      id: '1',
      name: 'ffggfd',
      description: 'user1',
      state: 'none',
      attribution: 'none',
      creator: 'none',
      action: (
        <>
          <a href="#h" className={classes.actionStyle} onClick={() => {}}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a href="#h" className={classes.actionStyle} onClick={() => {}}>
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  ]

  const count = data.size ? data.size : data.length

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classx.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dt, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={dt.id}>
                  {columns.map((column) => {
                    const value = dt[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classx.tableCellBody}>
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
        className={classx.tableFooter}
      />
      <Dialog
        open={showWarning}
        onClose={handleCloseWarning}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      ></Dialog>
      {/* <ViewScene sceneCreator viewModal={open} closeViewModal={handleClose} /> */}
    </div>
  )
}
export default connect(mapStateToProps, mapDispatchToProps)(SceneTable)
