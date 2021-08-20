import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import InputBase from '@material-ui/core/InputBase'
import { useStyles, useStyle } from './styles'
import EditGroup from './EditGroup'

interface Props {
  groupAdmin: any
  closeViewModal: any
  openView: boolean
}

const ViewGroup = (props: Props) => {
  const classx = useStyle()
  const classes = useStyles()
  const { openView, groupAdmin, closeViewModal } = props
  const [editMode, setEditMode] = React.useState(false)

  return (
    <Drawer anchor="right" open={openView} onClose={() => closeViewModal(false)} classes={{ paper: classx.paper }}>
      {editMode ? (
        <EditGroup groupAdmin={groupAdmin} closeEditModal={setEditMode} />
      ) : (
        <React.Fragment>
          <Paper elevation={3} className={classes.paperHeight}>
            <Container maxWidth="sm">
              <div className={classes.center}>
                <Typography variant="h4" component="span" className={classes.typo}>
                  {groupAdmin.name}
                </Typography>
              </div>
            </Container>
          </Paper>
          <Container maxWidth="lg" className={classes.marginTop}>
            <Typography variant="h4" component="h4" className={classes.mb20px}>
              Group Information
            </Typography>
            <Grid container spacing={3} className={classes.mt10}>
              <Grid item xs={6}>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  Name:
                </Typography>
                <Typography variant="h5" component="h5" className={classes.mb10}>
                  Description:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {groupAdmin?.name || <span className={classes.spanNone}>None</span>}
                </Typography>
                <Typography variant="h6" component="h6" className={classes.mb10}>
                  {groupAdmin?.description || <span className={classes.spanNone}>None</span>}
                </Typography>
              </Grid>
            </Grid>
          </Container>
          <DialogActions className={classes.mb10}>
            <div className={classes.marginTop}>
              <Button
                className={classes.saveBtn}
                onClick={() => {
                  setEditMode(true)
                }}
              >
                EDIT
              </Button>
              <Button onClick={() => closeViewModal()} className={classes.saveBtn}>
                CANCEL
              </Button>
            </div>
          </DialogActions>
        </React.Fragment>
      )}
    </Drawer>
  )
}

export default ViewGroup
