import React, { useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import Cross from '@material-ui/icons/Cancel'
import Cached from '@material-ui/icons/Cached'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'
import TablePagination from '@material-ui/core/TablePagination'
import { useAuthState } from '../../../user/state/AuthService'
import { PROJECT_PAGE_LIMIT, useProjectState } from '../../state/ProjectService'
import { fetchAdminProjects, removeProject, triggerReload, uploadProject } from '../../state/ProjectService'
import styles from './Projects.module.scss'
import AddToContentPackModal from '../ContentPack/AddToContentPackModal'
import UploadProjectModal from './UploadProjectModal'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

const Projects = () => {
  const authState = useAuthState()
  const user = authState.user
  const adminProjectState = useProjectState()
  const adminProjects = adminProjectState.projects
  const adminProjectCount = adminProjects.value.length

  const headCell = [
    // { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
    { id: 'update', numeric: false, disablePadding: true, label: 'Update' },
    { id: 'remove', numeric: false, disablePadding: false, label: 'Remove' }
  ]

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1
    }
    if (b[orderBy] > a[orderBy]) {
      return 1
    }
    return 0
  }

  type Order = 'asc' | 'desc'

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  }

  function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0])
      if (order !== 0) return order
      return a[1] - b[1]
    })
    const returned = stabilizedThis.map((el) => el[0])
    return returned
  }

  interface EnhancedTableProps {
    object: string
    numSelected: number
    onRequestSort: (event: React.MouseEvent<unknown>, property) => void
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
    order: Order
    orderBy: string
    rowCount: number
  }

  function EnhancedTableHead(props: EnhancedTableProps) {
    const { object, order, orderBy, onRequestSort } = props
    const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

    return (
      <TableHead className={styles.thead}>
        <TableRow className={styles.trow}>
          {headCell.map((headCell) => (
            <TableCell
              className={styles.tcell}
              key={headCell.id}
              align="right"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    )
  }

  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('name')
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PROJECT_PAGE_LIMIT)
  const [addToContentPackModalOpen, setAddToContentPackModalOpen] = useState(false)
  const [uploadProjectsModalOpen, setUploadProjectsModalOpen] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<ProjectInterface[]>([])
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  })

  const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // const newSelecteds = adminProjects.value.map((n) => n.name)
      // setSelected(newSelecteds)
      // return
    }
    setSelected([])
  }

  // const handlePageChange = (event: unknown, newPage: number) => {
  //   const incDec = page < newPage ? 'increment' : 'decrement'
  //   fetchAdminProjects(incDec)
  //   setPage(newPage)
  // }

  // const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setRowsPerPage(parseInt(event.target.value, 10))
  //   setPage(0)
  // }

  const onRemoveProject = async (e: any, row: any) => {
    const projectToRemove = adminProjects.value.find((project) => project.name === row.name)!
    await removeProject(projectToRemove.id!)
  }

  const tryReuploadProjects = async (row) => {
    try {
      const existingProjects = adminProjects.value.find((projects) => projects.name === row.name)!
      await uploadProject(existingProjects.repositoryPath)
    } catch (err) {
      console.log(err)
    }
  }

  // useEffect(() => {
  //   fetchTick()
  // }, [])

  useEffect(() => {
    if (user?.id.value != null && adminProjectState.updateNeeded.value === true) {
      fetchAdminProjects()
    }
  }, [adminProjectState.updateNeeded.value])

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  const handleWindowResize = () => {
    setDimensions({
      height: window.innerHeight,
      width: window.innerWidth
    })
  }

  return (
    <div>
      <Paper className={styles.adminRoot}>
        <Grid container spacing={3} className={styles.marginBottom}>
          <Grid item xs={6}>
            <Button
              className={styles['open-modal']}
              type="button"
              variant="contained"
              color="primary"
              onClick={() => setUploadProjectsModalOpen(true)}
            >
              {'Add Project'}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              className={styles['open-modal']}
              type="button"
              variant="contained"
              color="primary"
              onClick={triggerReload}
            >
              {'Rebuild'}
            </Button>
          </Grid>
        </Grid>
        <TableContainer className={styles.tableContainer}>
          <Table stickyHeader aria-labelledby="tableTitle" size={'medium'} aria-label="enhanced table">
            <EnhancedTableHead
              object={'projects'}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={adminProjectCount || 0}
            />
            <TableBody>
              {adminProjects.value.map((row) => {
                return (
                  <TableRow
                    hover
                    className={styles.trowHover}
                    style={{ color: 'black !important' }}
                    // onClick={(event) => handleLocationClick(event, row.id.toString())}
                    tabIndex={-1}
                    key={row.name}
                  >
                    <TableCell className={styles.tcell} align="right">
                      {row.name}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {user.userRole.value === 'admin' && (
                        <Button
                          className={styles.checkbox}
                          onClick={(e) => tryReuploadProjects(row)}
                          name="stereoscopic"
                          color="primary"
                        >
                          <Cached />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className={styles.tcell} align="right">
                      {user.userRole.value === 'admin' && (
                        <Button
                          className={styles.checkbox}
                          onClick={(e) => onRemoveProject(e, row)}
                          name="stereoscopic"
                          color="primary"
                        >
                          <Cross />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* <div className={styles.tableFooter}>
          <TablePagination
            rowsPerPageOptions={[PROJECT_PAGE_LIMIT]}
            component="div"
            count={adminProjectCount || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            className={styles.tablePagination}
          />
        </div> */}
        <AddToContentPackModal
          open={addToContentPackModalOpen}
          projects={selectedProjects}
          handleClose={() => setAddToContentPackModalOpen(false)}
        />
        <UploadProjectModal open={uploadProjectsModalOpen} handleClose={() => setUploadProjectsModalOpen(false)} />
      </Paper>
    </div>
  )
}

export default Projects
