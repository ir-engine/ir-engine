import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useSceneStyles, useSceneStyle } from './styles'
import { sceneColumns, SceneData } from './variables'
import TablePagination from '@mui/material/TablePagination'
import { SceneService } from '../../state/SceneService'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/state/AuthState'
import { useSceneState } from '../../state/SceneState'
import ViewScene from './ViewScene'
import { SCENE_PAGE_LIMIT } from '../../state/SceneState'

interface Props {}

const SceneTable = (props: Props) => {
  const classx = useSceneStyles()
  const classes = useSceneStyle()
  const authState = useAuthState()
  const user = authState.user

  const scene = useSceneState().scenes
  const sceneData = scene?.scenes
  const sceneCount = scene?.total
  const [singleScene, setSingleScene] = React.useState(null)
  const [open, setOpen] = React.useState(false)
  const [showWarning, setShowWarning] = React.useState(false)
  const [sceneId, setSceneId] = React.useState('')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(SCENE_PAGE_LIMIT)
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (user.id.value && scene.updateNeeded.value) {
      SceneService.fetchAdminScenes()
    }
  }, [user, scene.updateNeeded.value])

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    SceneService.fetchAdminScenes(incDec)
    setPage(newPage)
  }
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleClose = (open: boolean) => {
    setOpen(open)
  }

  const handleViewScene = (id: string) => {
    const scene = sceneData?.value.find((sc) => sc.id === id)
    if (scene !== undefined) {
      setSingleScene(scene)
      setOpen(true)
    }
  }

  const handleShowWarning = (id: string) => {
    setSceneId(id)
    setShowWarning(true)
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }

  const deleteSceneHandler = () => {
    setShowWarning(false)
    SceneService.deleteScene(sceneId)
  }

  const createData = (
    id: string,
    name: string,
    type: string,
    description: string,
    entity: any,
    version: any
  ): SceneData => {
    return {
      id,
      name,
      description,
      type,
      entity,
      version,
      action: (
        <>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanWhite} onClick={() => handleViewScene(id)}>
              View
            </span>
          </a>
          <a href="#h" className={classes.actionStyle} onClick={() => handleShowWarning(id)}>
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  const rows = sceneData?.value.map((el) => {
    return createData(
      el.id,
      el.name || <span className={classes.spanNone}>None</span>,
      el.type || <span className={classes.spanNone}>None</span>,
      el.description || <span className={classes.spanNone}>None</span>,
      el.entities.length || <span className={classes.spanNone}>None</span>,
      el.version || <span className={classes.spanNone}>None</span>
    )
  })

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {sceneColumns.map((column) => (
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
            {rows.map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {sceneColumns.map((column) => {
                    const value = row[column.id]
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
        rowsPerPageOptions={[SCENE_PAGE_LIMIT]}
        component="div"
        count={sceneCount?.value || 12}
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
      >
        <DialogTitle className={classes.alert} id="alert-dialog-title">
          {'Confirm to delete this scene!'}
        </DialogTitle>
        <DialogContent className={classes.alert}>
          <DialogContentText className={classes.alert} id="alert-dialog-description">
            Deleting scene can not be recovered!
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.alert}>
          <Button onClick={handleCloseWarning} className={classes.spanNone}>
            Cancel
          </Button>
          <Button className={classes.spanDange} onClick={deleteSceneHandler} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {singleScene && <ViewScene adminScene={singleScene} viewModal={open} closeViewModal={handleClose} />}
    </div>
  )
}
export default SceneTable
