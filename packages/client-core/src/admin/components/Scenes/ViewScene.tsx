import React from 'react'

import { Grid, Paper, Typography } from '@mui/material'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { useSceneStyle, useSceneStyles } from './styles'
import { EntityData, entityColumns } from './variables'

interface Props {
  adminScene: any
  viewModal: boolean
  closeViewModal: any
}

const ViewScene = (props: Props) => {
  const { adminScene, viewModal, closeViewModal } = props

  const classes = useSceneStyles()
  const classesx = useSceneStyle()

  const createData = (id, name, index, components): EntityData => {
    return {
      id,
      name,
      index,
      components
    }
  }

  const rows = adminScene.entities.map((el) => {
    return createData(
      el.id,
      el.name || <span className={classesx.spanNone}>None</span>,
      el.index || <span className={classesx.spanNone}>None</span>,
      el.components.length || <span className={classesx.spanNone}>None</span>
    )
  })

  return (
    <React.Fragment>
      <Drawer classes={{ paper: classesx.paper }} anchor="right" open={viewModal} onClose={() => closeViewModal(false)}>
        <React.Fragment>
          <Paper elevation={3} className={classes.paperHeight}>
            <Container maxWidth="sm">
              <div className={classes.center}>
                <Typography variant="h4" component="span" className={classes.typo}>
                  {adminScene.name}
                </Typography>
              </div>
            </Container>
          </Paper>
          <Container maxWidth="lg" className={classes.marginTop}>
            <Typography variant="h4" component="h4" className={`${classes.mb40px} ${classes.headingFont}`}>
              Scene Information
            </Typography>
            <Container className={classes.mb40px}>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={6}>
                  <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFontsm}`}>
                    Type:
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFont}`}>
                    SID:
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFont}`}>
                    Entities:
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFont}`}>
                    version:
                  </Typography>
                  <Typography variant="h5" component="h5" className={`${classes.mb10} ${classes.typoFont}`}>
                    Description:
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={6}>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                    {adminScene?.type || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                    {adminScene?.sid || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                    {adminScene?.entities.length || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                    {adminScene?.version || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                  <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                    {adminScene?.description || <span className={classesx.spanNone}>None</span>}
                  </Typography>
                </Grid>
              </Grid>
            </Container>
            <Typography variant="h4" component="h4" className={`${classes.mb40px} ${classes.headingFont}`}>
              Entity Information
            </Typography>
            <Container>
              <TableContainer className={classesx.groupContainer}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      {entityColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          align={col.align}
                          style={{ minWidth: col.minWidth }}
                          className={classes.tableCellHeader}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, id) => (
                      <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                        {entityColumns.map((column) => {
                          const value = row[column.id]
                          return (
                            <TableCell key={column.id} align={column.align} className={classes.tableCellBody}>
                              {value}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Container>
          </Container>
        </React.Fragment>
      </Drawer>
    </React.Fragment>
  )
}

export default ViewScene
