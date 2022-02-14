import { Grid, Paper, Typography } from '@mui/material'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import React from 'react'
import { entityColumns, EntityData, ViewSceneProps } from '../../common/variables/scene'
import { useStyles } from '../../styles/ui'

const ViewScene = (props: ViewSceneProps) => {
  const { adminScene, viewModal, closeViewModal } = props

  const classes = useStyles()

  const createData = (id, name, index, components): EntityData => {
    return {
      id,
      name,
      index,
      components
    }
  }

  const rows = adminScene?.entities?.map((el) => {
    return createData(
      el.id,
      el.name || <span className={classes.spanNone}>None</span>,
      el.index || <span className={classes.spanNone}>None</span>,
      el.components.length || <span className={classes.spanNone}>None</span>
    )
  })

  return (
    <React.Fragment>
      <Drawer
        classes={{ paper: classes.paperDrawer }}
        anchor="right"
        open={viewModal}
        onClose={() => closeViewModal(false)}
      >
        <Paper elevation={3} className={classes.rootPaper}>
          <Container maxWidth="sm">
            <div className={classes.locationTitle}>
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
                  {adminScene?.type || <span className={classes.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                  {adminScene?.sid || <span className={classes.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                  {adminScene?.entities?.length || <span className={classes.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                  {adminScene?.version || <span className={classes.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={`${classes.mb10} ${classes.typoFontsm}`}>
                  {adminScene?.description || <span className={classes.spanNone}>None</span>}
                </Typography>
              </Grid>
            </Grid>
          </Container>
          {adminScene?.entities && (
            <>
              <Typography variant="h4" component="h4" className={`${classes.mb40px} ${classes.headingFont}`}>
                Entity Information
              </Typography>
              <Container>
                <TableContainer className={classes.groupContainer}>
                  <Table className={classes.viewEntityTable} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        {entityColumns.map((col, index) => (
                          <TableCell
                            key={index}
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
                      {rows.map((row, index) => (
                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
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
            </>
          )}
        </Container>
      </Drawer>
    </React.Fragment>
  )
}

export default ViewScene
